"""
pathforge_service.py
─────────────────────
PathForge AI — uses Google Gemini to generate learning roadmaps.
"""

import json
import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

# ── Configure Gemini ──────────────────────────────────────────────────────────
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    logger.info("✅ Gemini configured with API key (length: %d)", len(settings.GEMINI_API_KEY))
else:
    logger.error("❌ GEMINI_API_KEY is missing from .env!")

# ── Model name — use gemini-1.5-flash (most stable free-tier model) ───────────
# If you have Gemini 2.0 access, you can try "gemini-2.0-flash-exp" instead
GEMINI_MODEL = "gemini-1.5-flash"

SYSTEM_PROMPT = """You are PathForge — an expert learning path architect used by top engineers and students worldwide.

Your job: given a user's learning goal AND their current skill level, generate a structured, real-world, actionable roadmap.

STRICT OUTPUT RULES:
1. Return ONLY valid JSON — no markdown, no explanation, no code fences, no ```json blocks
2. Follow the exact schema below
3. The roadmap MUST contain between 4 and 7 levels — NEVER return empty levels
4. Each level MUST have 4-6 tasks
5. Tasks must be concrete, actionable, specific (not vague like "learn basics")
6. XP values: beginner tasks = 20-40 XP, intermediate = 40-70 XP, advanced = 70-100 XP
7. Total roadmap should take 3-6 months realistically

SKILL LEVEL ADAPTATION:
- "beginner": Start from absolute basics. Include foundational concepts. More hand-holding. 5-7 levels. Simpler tasks first.
- "intermediate": Skip basics. Assume core knowledge exists. Focus on applied skills and deeper concepts. 4-6 levels. Include projects.
- "advanced": Expert-track only. Skip fundamentals entirely. Focus on system design, optimization, cutting-edge topics. 4-5 levels. Heavy on projects and real-world challenges.

JSON SCHEMA:
{
  "goal": "string — cleaned up goal title",
  "tagline": "string — one powerful sentence describing the outcome",
  "total_xp": number,
  "estimated_weeks": number,
  "levels": [
    {
      "id": number,
      "title": "string — e.g. Foundations",
      "subtitle": "string — what this level covers in 8 words max",
      "color": "string — hex color (use: #7c6aff | #2dffc0 | #f5c842 | #ff6b35 | #a89bff | #ff4d6d)",
      "emoji": "string — one relevant emoji",
      "duration_weeks": number,
      "tasks": [
        {
          "id": number,
          "title": "string — specific task name",
          "description": "string — what to do and why, 1-2 sentences",
          "xp": number,
          "resource_type": "string — video | article | practice | project | book",
          "resource_hint": "string — e.g. 'Search: Python crash course freeCodeCamp'"
        }
      ]
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown formatting. No code blocks. Just pure JSON.
CRITICAL: The "levels" array must NEVER be empty. Always generate at least 4 levels."""


# ── Level-specific prompt templates ───────────────────────────────────────────
LEVEL_PROMPTS = {
    "beginner": (
        "The user is a COMPLETE BEGINNER with little to no experience in this area.\n"
        "- Start from the very basics and foundational concepts\n"
        "- Include setup/installation steps as early tasks\n"
        "- Use simple language in descriptions\n"
        "- Recommend beginner-friendly resources (freeCodeCamp, YouTube tutorials, docs)\n"
        "- Build up gradually — each level should feel achievable\n"
        "- Generate 5-7 levels to cover the full beginner-to-competent journey\n"
        "- Estimated timeline: 4-6 months"
    ),
    "intermediate": (
        "The user has INTERMEDIATE knowledge — they know the basics already.\n"
        "- Skip introductory/setup content entirely\n"
        "- Focus on applied skills, patterns, best practices, and deeper concepts\n"
        "- Include at least 2 project-based tasks\n"
        "- Recommend intermediate resources (official docs, books, courses)\n"
        "- Generate 4-6 levels focusing on skill deepening\n"
        "- Estimated timeline: 3-5 months"
    ),
    "advanced": (
        "The user is ADVANCED — they have strong fundamentals and practical experience.\n"
        "- Skip ALL basics and intermediate content\n"
        "- Focus on system design, architecture, optimization, and edge cases\n"
        "- Include real-world complex projects and open-source contributions\n"
        "- Recommend advanced resources (research papers, advanced books, conference talks)\n"
        "- Generate 4-5 intensive levels\n"
        "- Estimated timeline: 3-4 months"
    ),
}


def clean_json_response(raw: str) -> str:
    """Remove markdown code fences if Gemini adds them despite instructions."""
    text = raw.strip()

    # Handle ```json ... ``` wrapper
    if text.startswith("```"):
        first_newline = text.find("\n")
        if first_newline != -1:
            text = text[first_newline + 1:]
        if text.endswith("```"):
            text = text[:-3].strip()

    # Handle leftover backticks
    if text.startswith("```"):
        text = text.lstrip("`").strip()
        if text.lower().startswith("json"):
            text = text[4:].strip()

    return text


def validate_roadmap(data: dict, goal: str) -> dict:
    """
    Validate and fix the roadmap structure.
    Ensures levels exist and have proper structure.
    Raises ValueError if levels are empty (no silent fallback).
    """
    if not isinstance(data, dict):
        raise ValueError(f"AI returned non-dict response: {type(data)}")

    if "levels" not in data or not isinstance(data.get("levels"), list):
        raise ValueError("AI response missing 'levels' array")

    if len(data["levels"]) == 0:
        raise ValueError("AI returned empty levels array — prompt may have been blocked or misunderstood")

    # Ensure goal and tagline exist
    data.setdefault("goal", goal)
    data.setdefault("tagline", f"Your personalized roadmap to master {goal}")

    # Validate and fill defaults for each level
    for i, level in enumerate(data["levels"]):
        level.setdefault("id", i + 1)
        level.setdefault("title", f"Level {i + 1}")
        level.setdefault("subtitle", "")
        level.setdefault("color", "#7c6aff")
        level.setdefault("emoji", "📚")
        level.setdefault("duration_weeks", 2)

        if "tasks" not in level or not isinstance(level.get("tasks"), list):
            level["tasks"] = []

        for j, task in enumerate(level["tasks"]):
            task.setdefault("id", j + 1)
            task.setdefault("title", f"Task {j + 1}")
            task.setdefault("description", "")
            task.setdefault("xp", 30)
            task.setdefault("resource_type", "article")
            task.setdefault("resource_hint", "")

    # Recompute total XP from actual tasks
    computed_xp = sum(
        task.get("xp", 0)
        for level in data["levels"]
        for task in level.get("tasks", [])
    )
    data["total_xp"] = computed_xp

    # Recompute estimated weeks from level durations
    total_weeks = sum(level.get("duration_weeks", 2) for level in data["levels"])
    data["estimated_weeks"] = total_weeks

    return data


def generate_roadmap_sync(goal: str, user_level: str = "beginner") -> dict:
    """
    Generate a structured roadmap using Google Gemini.

    Returns parsed dict on success.
    Raises ValueError with a clear message on failure.
    NO silent fallback — all errors are propagated to the caller.
    """

    # ── Guard: API key must exist ─────────────────────────────────────────────
    if not settings.GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is not set. "
            "Get a FREE key at https://aistudio.google.com/apikey "
            "and add GEMINI_API_KEY=your_key to your .env file."
        )

    # ── Normalize user_level ──────────────────────────────────────────────────
    user_level = (user_level or "beginner").lower().strip()
    if user_level not in LEVEL_PROMPTS:
        logger.warning("Unknown user_level '%s', defaulting to 'beginner'", user_level)
        user_level = "beginner"

    level_instructions = LEVEL_PROMPTS[user_level]

    user_prompt = (
        f'Generate a complete learning roadmap for this goal: "{goal}"\n\n'
        f"USER SKILL LEVEL: {user_level.upper()}\n\n"
        f"{level_instructions}\n\n"
        f"Make the roadmap:\n"
        f'- Specific to "{goal}" (no generic filler)\n'
        f"- Progressive (each level builds on the previous)\n"
        f"- Practical and industry-relevant\n"
        f"- Motivating and achievable\n\n"
        f"Remember: Return ONLY valid JSON. No markdown. No code fences. "
        f"The levels array must have at least 4 items."
    )

    raw = None  # Keep in scope for error logging

    try:
        logger.info(
            "🚀 PathForge generating | Goal: '%s' | Level: '%s' | Model: %s",
            goal, user_level, GEMINI_MODEL
        )

        # ── Init model ────────────────────────────────────────────────────────
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.8,
                "max_output_tokens": 8192,
                # NOTE: response_mime_type="application/json" forces JSON output
                # but is only supported on gemini-1.5-* and gemini-2.0-* models.
                # Remove this line if you get a "not supported" error.
                #"response_mime_type": "application/json",
            },
        )

        # ── Call Gemini ───────────────────────────────────────────────────────
        full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"
        logger.debug("📤 Sending prompt (%d chars) to Gemini", len(full_prompt))

        response = model.generate_content(full_prompt)

        # ── Check for blocked response ────────────────────────────────────────
        if not response.candidates:
            block_reason = getattr(response, "prompt_feedback", "unknown reason")
            logger.error("❌ Gemini returned no candidates. Feedback: %s", block_reason)
            raise ValueError(
                f"AI request was blocked ({block_reason}). "
                "Try rephrasing your goal."
            )

        candidate = response.candidates[0]
        finish_reason = getattr(candidate, "finish_reason", None)
        logger.info("📥 Finish reason: %s", finish_reason)

        # finish_reason 2 = MAX_TOKENS, 3 = SAFETY, 1 = STOP (normal)
        if str(finish_reason) in ("3", "SAFETY"):
            raise ValueError("AI response was blocked by safety filters. Try a different goal.")

        raw = response.text
        logger.info("✅ Raw response length: %d chars", len(raw))
        logger.info("📋 Response preview (first 500 chars):\n%s", raw[:500])

        # ── Parse JSON ────────────────────────────────────────────────────────
        cleaned = clean_json_response(raw)
        logger.debug("🧹 Cleaned JSON (first 300 chars):\n%s", cleaned[:300])

        data = json.loads(cleaned)

        # ── Validate structure ────────────────────────────────────────────────
        data = validate_roadmap(data, goal)

        logger.info(
            "✅ PathForge SUCCESS | Goal: '%s' | Level: %s | Levels: %d | XP: %d | Weeks: %d",
            goal, user_level, len(data["levels"]), data["total_xp"], data["estimated_weeks"]
        )

        return data

    except json.JSONDecodeError as e:
        logger.error("❌ JSON parse error: %s", str(e))
        logger.error("📋 Raw response that failed to parse:\n%s", raw[:2000] if raw else "N/A")
        raise ValueError(
            f"AI returned malformed JSON. Please try again. "
            f"(Error: {str(e)})"
        )

    except ValueError:
        # Re-raise our own validation/guard errors as-is
        raise

    except Exception as e:
        err_type = type(e).__name__
        err_msg  = str(e)
        logger.error("❌ Gemini API error | Type: %s | Message: %s", err_type, err_msg)

        # Give actionable hints for common errors
        if "API_KEY" in err_msg.upper() or "api key" in err_msg.lower():
            raise ValueError(
                "Invalid Gemini API key. "
                "Check your GEMINI_API_KEY in .env — "
                "get a free key at https://aistudio.google.com/apikey"
            )
        if "quota" in err_msg.lower() or "429" in err_msg:
            raise ValueError(
                "Gemini API quota exceeded. "
                "Wait a minute and try again, or check your usage at "
                "https://aistudio.google.com"
            )
        if "not found" in err_msg.lower() or "404" in err_msg:
            raise ValueError(
                f"Model '{GEMINI_MODEL}' not found. "
                "Try changing GEMINI_MODEL to 'gemini-1.5-flash' in pathforge_service.py"
            )

        raise ValueError(
            f"AI generation failed ({err_type}): {err_msg}. "
            "Check your API key and try again."
        )