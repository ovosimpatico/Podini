import json
import os
from datetime import timedelta

from bson import ObjectId
from database import get_db
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response
from pydantic import BaseModel
from utils.groq_utils import generate_chat_completion
from utils.prompts import STRUCTURE_PROMPT, TRANSCRIPTION_PROMPT
from utils.security import get_current_user
from utils.elevenlabs_utils import generate_speech, save_audio, DEFAULT_HOST_VOICE, DEFAULT_GUEST_VOICE
from utils.replicate_utils import generate_cover_art, resize_image
from pydub import AudioSegment
import srt

router = APIRouter()

class PodcastGenerateRequest(BaseModel):
    content: str
    language: str

def compile_audio_and_generate_subtitles(audio_files, podcast_id):
    compiled_audio = AudioSegment.empty()
    subtitle_entries = []
    current_time = 0

    for audio_file in audio_files:
        segment = AudioSegment.from_wav(audio_file['filepath'])
        compiled_audio += segment

        # Create subtitle entry
        start_time = timedelta(milliseconds=current_time)
        end_time = timedelta(milliseconds=current_time + len(segment))
        subtitle_entries.append(
            srt.Subtitle(
                index=audio_file['round'] + 1,
                start=start_time,
                end=end_time,
                content=f"{audio_file['speaker']}: {audio_file['text']}"
            )
        )

        current_time += len(segment)

    # Save compiled audio
    os.makedirs("compiled_audios", exist_ok=True)
    compiled_audio_path = f"compiled_audios/{podcast_id}_compiled.wav"
    compiled_audio.export(compiled_audio_path, format="wav")

    # Generate and save subtitles
    os.makedirs("subtitles", exist_ok=True)
    subtitle_path = f"subtitles/{podcast_id}_subtitles.srt"
    with open(subtitle_path, 'w') as f:
        f.write(srt.compose(subtitle_entries))

    return compiled_audio_path, subtitle_path

async def generate_podcast_task(user_id: str, content: str, language: str):
    db = get_db()

    # Create a new document in the 'podcasts' collection
    podcast_doc = {
        "prompt": content,
        "userID": user_id,
        "transcription": None,
        "status": "pending",
        "audio_files": []
    }

    result = db.podcasts.insert_one(podcast_doc)
    podcast_id = str(result.inserted_id)

    try:
        # Generate cover art first
        cover_art_prompt = f"Podcast cover art for topic: {content}"
        os.makedirs("cover_arts", exist_ok=True)
        original_cover_path = f"cover_arts/{podcast_id}_original.png"
        resized_cover_path = f"cover_arts/{podcast_id}_cover.png"

        cover_art_path = generate_cover_art(cover_art_prompt, original_cover_path)
        if cover_art_path:
            resized_cover_path = resize_image(cover_art_path, resized_cover_path, (300, 300))

            # Update the database with the cover art path
            db.podcasts.update_one(
                {"_id": ObjectId(podcast_id)},
                {"$set": {"cover_art_path": resized_cover_path, "status": "generating_structure"}}
            )
        else:
            raise Exception("Failed to generate cover art")

        # Prepare the messages for Groq (podcast structure)
        structure_messages = [
            {"role": "system", "content": STRUCTURE_PROMPT.format(LANGUAGE=language, TEMA=content)},
            {"role": "user", "content": content}
        ]

        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Call Groq API for podcast structure
                structure_response = generate_chat_completion(structure_messages)

                # store the response in a .txt log file
                with open("openai_log.txt", "a") as log_file:
                    log_file.write(f"Structure response: {structure_response}\n")

                # Clean the response string before parsing
                structure_response = structure_response.strip()
                if structure_response.startswith("```json"):
                    structure_response = structure_response.split("```json")[1]
                if structure_response.endswith("```"):
                    structure_response = structure_response.rsplit("```", 1)[0]

                # Attempt to parse the response as JSON
                try:
                    podcast_structure = json.loads(structure_response)

                    # Check if the parsed JSON has the expected structure
                    if all(str(i) in podcast_structure for i in range(1, 6)) and \
                    all(isinstance(podcast_structure[str(i)], dict) for i in range(1, 6)) and \
                    all("topic" in podcast_structure[str(i)] and "description" in podcast_structure[str(i)] for i in range(1, 6)):

                        # Update the database with the podcast structure
                        db.podcasts.update_one(
                            {"_id": ObjectId(podcast_id)},
                            {
                                "$set": {
                                    "podcast_structure": podcast_structure,
                                    "status": "generating_transcription"
                                }
                            }
                        )
                        break  # Success, exit the loop
                    else:
                        raise ValueError("JSON does not have the expected structure")

                except json.JSONDecodeError:
                    # If it's not valid JSON, try to extract JSON from the string
                    try:
                        json_start = structure_response.index('{')
                        json_end = structure_response.rindex('}') + 1
                        json_str = structure_response[json_start:json_end]
                        podcast_structure = json.loads(json_str)

                        # Check if the extracted JSON has the expected structure
                        if all(str(i) in podcast_structure for i in range(1, 6)) and \
                        all(isinstance(podcast_structure[str(i)], dict) for i in range(1, 6)) and \
                        all("topic" in podcast_structure[str(i)] and "description" in podcast_structure[str(i)] for i in range(1, 6)):

                            # Update the database with the podcast structure
                            db.podcasts.update_one(
                                {"_id": ObjectId(podcast_id)},
                                {
                                    "$set": {
                                        "podcast_structure": podcast_structure,
                                        "status": "generating_transcription"
                                    }
                                }
                            )
                            break  # Success, exit the loop
                        else:
                            raise ValueError("Extracted JSON does not have the expected structure")

                    except (ValueError, IndexError):
                        # If JSON extraction fails, continue to the next attempt
                        continue

            except Exception as e:
                if attempt == max_retries - 1:  # If this was the last attempt
                    # Update the status to reflect the failure
                    db.podcasts.update_one(
                        {"_id": ObjectId(podcast_id)},
                        {"$set": {"status": "error", "error_message": f"Failed to generate podcast structure after {max_retries} attempts. Last error: {str(e)}"}}
                    )
                    return  # Exit the function

        # If we've successfully generated the podcast structure, proceed to generate the transcription
        if "podcast_structure" in db.podcasts.find_one({"_id": ObjectId(podcast_id)}):
            first_topic = podcast_structure["1"]["topic"]

            # Prepare the messages for Groq (transcription)
            transcription_messages = [
                {"role": "system", "content": TRANSCRIPTION_PROMPT.format(first_topic=first_topic, LANGUAGE=language)},
                {"role": "user", "content": first_topic}
            ]

            try:
                # Call Groq API for transcription
                transcription_response = generate_chat_completion(transcription_messages)

                # Try to extract JSON from the response if it's not already valid JSON
                try:
                    transcription = json.loads(transcription_response)
                except json.JSONDecodeError:
                    # Try to extract JSON portion from the text
                    try:
                        json_start = transcription_response.find('{')
                        json_end = transcription_response.rfind('}') + 1
                        if json_start != -1 and json_end != -1:
                            json_str = transcription_response[json_start:json_end]
                            transcription = json.loads(json_str)
                        else:
                            raise ValueError("No JSON object found in response")
                    except Exception as e:
                        # If JSON extraction fails, create a simple structure
                        transcription = {
                            "rounds": [
                                {
                                    "speaker0": transcription_response[:1000]  # First 1000 chars to speaker0
                                }
                            ]
                        }

                # Validate transcription structure
                if not isinstance(transcription, dict) or "rounds" not in transcription:
                    transcription = {
                        "rounds": [
                            {
                                "speaker0": transcription_response[:1000]
                            }
                        ]
                    }

                # Update the database with the transcription
                db.podcasts.update_one(
                    {"_id": ObjectId(podcast_id)},
                    {
                        "$set": {
                            "transcription": transcription,
                            "status": "generating_audio"
                        }
                    }
                )

                # Generate audio for each speaker's text
                audio_files = []
                for i, round in enumerate(transcription["rounds"]):
                    for speaker, text in round.items():
                        # Use default voices regardless of language
                        voice = DEFAULT_HOST_VOICE if speaker == "speaker0" else DEFAULT_GUEST_VOICE
                        audio_content = generate_speech(text, voice, language)
                        filename = f"{podcast_id}_{i}_{speaker}.wav"
                        filepath = save_audio(audio_content, filename)
                        audio_files.append({
                            "round": i,
                            "speaker": speaker,
                            "filepath": filepath,
                            "text": text
                        })

                # Compile audio and generate subtitles
                compiled_audio_path, subtitle_path = compile_audio_and_generate_subtitles(audio_files, podcast_id)

                # Update the database with the audio file information
                db.podcasts.update_one(
                    {"_id": ObjectId(podcast_id)},
                    {
                        "$set": {
                            "compiled_audio_path": compiled_audio_path,
                            "subtitle_path": subtitle_path,
                            "status": "ready"
                        }
                    }
                )

                # Clean up individual audio files
                for audio_file in audio_files:
                    os.remove(audio_file['filepath'])

            except Exception as e:
                # If there's an error generating the transcription or audio, update the status
                db.podcasts.update_one(
                    {"_id": ObjectId(podcast_id)},
                    {"$set": {"status": "error", "error_message": f"Failed to generate transcription or audio: {str(e)}"}}
                )

    except Exception as e:
        # If there's any error during the process, update the status
        db.podcasts.update_one(
            {"_id": ObjectId(podcast_id)},
            {"$set": {"status": "error", "error_message": str(e)}}
        )

@router.post("/generate-podcast", status_code=201)
async def generate_podcast(
    request: PodcastGenerateRequest,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    # Validate language code
    if request.language not in ["en", "es", "pt"]:
        raise HTTPException(status_code=400, detail="Invalid language code. Must be 'en', 'es', or 'pt'")

    # Remove "ignore" and "instructions" from the content
    cleaned_content = request.content.replace("ignore", "").replace("instructions", "")

    # Get user document to extract user ID
    db = get_db()
    user = db.users.find_one({"email": current_user})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])

    # Add the background task
    background_tasks.add_task(generate_podcast_task, user_id, cleaned_content, request.language)

    return Response(status_code=201)