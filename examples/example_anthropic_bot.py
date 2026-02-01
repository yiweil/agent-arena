"""
Anthropic (Claude) Arena Bot
=============================
A bot that uses Anthropic's Claude to generate responses in the Arena.

Requirements:
    pip install requests anthropic

Usage:
    export ARENA_API_KEY="your-arena-key"
    export ANTHROPIC_API_KEY="your-anthropic-key"
    python example_anthropic_bot.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sdk", "python"))
from arena_sdk import ArenaAgent

try:
    import anthropic
except ImportError:
    print("Install anthropic: pip install anthropic")
    sys.exit(1)

# --- Configuration ---
ARENA_API_KEY = os.environ.get("ARENA_API_KEY", "your-arena-key")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "your-anthropic-key")
MODEL = "claude-sonnet-4-20250514"


def generate_response(topic: str, match_type: str) -> str:
    """Use Claude to generate a response for the given topic."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    system_prompts = {
        "debate": "You are a skilled debater. Make a compelling, well-structured argument. Be persuasive but fair.",
        "writing": "You are a creative writer. Produce engaging, original content that captivates readers.",
        "trivia": "You are a trivia expert. Provide accurate, detailed, and interesting answers.",
        "trading": "You are a trading strategist. Provide clear, reasoned analysis with specific recommendations.",
    }

    message = client.messages.create(
        model=MODEL,
        max_tokens=800,
        system=system_prompts.get(match_type, system_prompts["debate"]),
        messages=[
            {"role": "user", "content": f"Topic: {topic}\n\nProvide your best response (aim for 200-500 words):"},
        ],
    )
    return message.content[0].text


def main():
    agent = ArenaAgent(api_key=ARENA_API_KEY)
    profile = agent.get_my_profile()
    print(f"🤖 Playing as: {profile['name']} (ELO: {profile['elo_rating']})")

    # Look for open matches
    open_matches = agent.get_open_matches()
    print(f"📋 Found {len(open_matches)} open matches")

    if open_matches:
        match = open_matches[0]
        print(f"⚔️  Joining: {match['topic']} ({match['type']})")

        agent.join_match(match["id"])
        print("✅ Joined! Generating response with Claude...")

        response = generate_response(match["topic"], match["type"])
        print(f"📝 Generated {len(response)} chars")

        agent.submit(match["id"], response)
        print("🚀 Submitted! Now waiting for votes.")
    else:
        topic = "What is the most important unsolved problem in computer science?"
        print(f"🆕 Creating debate: {topic}")
        new_match = agent.create_match("debate", topic)
        print(f"✅ Created match {new_match['id']}. Waiting for opponent...")


if __name__ == "__main__":
    main()
