from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse, FileResponse
from utils.security import get_current_user
from database import get_db
from bson import ObjectId
import os
import re

router = APIRouter()

@router.get("/get-structure")
async def get_podcast_structure(current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])

    # Fetch all podcasts for the user
    podcasts = db.podcasts.find({"userID": user_id})

    # Create a dictionary to store podcast structures
    podcast_structures = {}

    for podcast in podcasts:
        if "podcast_structure" in podcast and "prompt" in podcast:
            podcast_structures[podcast["prompt"]] = podcast["podcast_structure"]

    return podcast_structures

@router.get("/stream-audio/{podcast_id}")
async def stream_audio(podcast_id: str, current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    podcast = db.podcasts.find_one({"_id": ObjectId(podcast_id), "userID": str(user["_id"])})

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    if podcast["status"] != "ready":
        raise HTTPException(status_code=400, detail="Podcast is not ready for streaming")

    audio_path = podcast.get("compiled_audio_path")
    if not audio_path or not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    def iterfile():
        chunk_size = 1024 * 1024  # 1MB chunks
        with open(audio_path, mode="rb") as file:
            while chunk := file.read(chunk_size):
                yield chunk

    return StreamingResponse(
        iterfile(),
        media_type="audio/wav",
        headers={
            'Accept-Ranges': 'bytes',
            'Content-Type': 'audio/wav'
        }
    )

@router.get("/get-subtitle/{podcast_id}")
async def get_subtitle(podcast_id: str, current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    podcast = db.podcasts.find_one({"_id": ObjectId(podcast_id), "userID": str(user["_id"])})

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    if podcast["status"] != "ready":
        raise HTTPException(status_code=400, detail="Podcast subtitles are not ready")

    subtitle_path = podcast.get("subtitle_path")
    if not subtitle_path or not os.path.exists(subtitle_path):
        raise HTTPException(status_code=404, detail="Subtitle file not found")

    try:
        with open(subtitle_path, 'r', encoding='ANSI') as file:
            srt_content = file.read()

        # Remove speaker prefix from each line
        srt_content = re.sub(r'\n[^>]*?: ', '\n', srt_content)

        # Convert SRT to WebVTT
        webvtt_content = "WEBVTT\n\n" + re.sub(
            r'(\d{2}):(\d{2}):(\d{2}),(\d{3})',
            r'\1:\2:\3.\4',
            srt_content
        )

        return Response(
            content=webvtt_content,
            media_type="text/vtt",
            headers={
                "Content-Disposition": f'attachment; filename="{podcast_id}_subtitles.vtt"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing subtitles: {str(e)}")

@router.get("/user-podcasts")
async def get_user_podcasts(current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = str(user["_id"])

    # Fetch all podcasts for the user
    podcasts = db.podcasts.find({"userID": user_id}, {"_id": 1, "status": 1, "prompt": 1})

    # Create a list of podcast information
    podcast_list = [
        {
            "id": str(podcast["_id"]),
            "status": podcast["status"],
            "prompt": podcast["prompt"]
        }
        for podcast in podcasts
    ]

    return podcast_list

@router.get("/get-cover/{podcast_id}")
async def get_cover(podcast_id: str, current_user: str = Depends(get_current_user)):
    db = get_db()
    user = db.users.find_one({"email": current_user})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    podcast = db.podcasts.find_one({"_id": ObjectId(podcast_id), "userID": str(user["_id"])})

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    cover_art_path = podcast.get("cover_art_path")
    if not cover_art_path or not os.path.exists(cover_art_path):
        raise HTTPException(status_code=404, detail="Cover art not found")

    return FileResponse(cover_art_path, media_type="image/png", filename=f"{podcast_id}_cover.png")