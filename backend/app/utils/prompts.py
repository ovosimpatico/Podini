STRUCTURE_PROMPT = r"""
Generate up to five distinct podcast topics based on the provided input phrase. The output must be in {LANGUAGE} and strictly in JSON format, with only the following structure:

{{
  "1": {{
    "topic": "",
    "description": ""
  }},
  "2": {{
    "topic": "",
    "description": ""
  }},
  "3": {{
    "topic": "",
    "description": ""
  }},
  "4": {{
    "topic": "",
    "description": ""
  }},
  "5": {{
    "topic": "",
    "description": ""
  }}
}}

Instructions:
1. **Sequential Filling**: Topics must be filled sequentially from "1" to "5." No entries should be skipped. If fewer than five topics are provided, the remaining entries must still be included in the structure but left empty.
2. **Cohesive Story**: Each podcast topic must relate directly to the input phrase and contribute to a larger cohesive narrative. Each topic must make sense as an individual episode but should also build upon the others, leading to a comprehensive exploration of the input phrase.
3. **Interconnected Themes**: The topics should not stand alone as completely separate discussions but should connect to each other, creating a bigger picture or theme when viewed together. However, each topic should still provide value independently, influenced directly by the input phrase "{TEMA}"
4. **Structure Consistency**: Ensure the output is strictly in the format provided, and no additional text, explanation, or formatting is included beyond the JSON structure.
"""

TRANSCRIPTION_PROMPT = r"""
Generate a long-form podcast discussion in {LANGUAGE} between two speakers about the provided topic "{first_topic}" The output must be formatted strictly in JSON with the following structure:

{{
  "rounds": [
    {{
      "speaker0": "",
      "speaker1": ""
    }},
    ...
  ]
}}

Instructions:
1. 25+ Rounds Minimum*: The conversation must include a minimum of 5 rounds. Each round must represent one exchange between "speaker0" and "speaker1." The conversation should be long, detailed, and thorough. It should NOT be brief or shallow—each round must move the conversation forward in meaningful ways.
2. *Speaker Labels*: Use "speaker0" for one speaker and "speaker1" for the other. Alternate between the two speakers in each round. Maintain the label order consistently throughout the entire dialogue.
3. *Length and Depth: This is meant to be a **long* process. Each speaker must engage in detailed responses, adding new information, expanding on prior points, and exploring all facets of the provided topic "{first_topic}." The dialogue should be expansive, reflecting a natural, thoughtful discussion over an extended period of time.
4. *Discussion of the Provided Topic*: The focus must be exclusively on the provided topic "{first_topic}." The conversation must thoroughly explore this topic in detail, with each speaker contributing new insights, ideas, and perspectives. Every round must remain on this specific topic without diverging.
5. *Structured Progression*: The conversation must evolve in a structured, logical way. Start with an introduction in the first few rounds, where the speakers introduce themselves and set up the discussion. The conversation should then progress through different angles and aspects of the topic, maintaining a logical and connected flow.
6. *Natural Flow*: The conversation must feel natural, as though two experts are deeply engaged in the topic. It should flow smoothly, with one speaker building on the previous speaker's point. No single response should be too brief—each must provide meaningful contributions to the discussion.
7. *Conclude Thoughtfully*: The final rounds must conclude the discussion naturally, providing a thoughtful wrap-up and summarizing the key points covered throughout the conversation. The ending must feel like a natural conclusion to a long-form podcast.
8. *Strict JSON Structure*: The output must strictly adhere to the JSON structure provided, with no extra text, explanations, or formatting beyond the structure. Every round must include both "speaker0" and "speaker1" exchanges, and all rounds must be part of the same cohesive discussion around the provided topic "{first_topic}."
9. *Each Round*: Each round should be a meaningful exchange between the two speakers, moving the conversation forward in a logical, engaging manner. Ensure that each round adds depth, detail, and new insights to the discussion, reflecting a rich, detailed exploration of the topic "{first_topic}."
"""