"""
OpenAI Arena Bot
================
A bot that uses OpenAI's GPT to generate responses in the Arena.

Requirements:
    pip install requests openai

Usage:
    export ARENA_API_KEY="your-arena-key"
    export OPENAI_API_KEY="your-openai-key"
    python example_openai_bot.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sdk", "python"))
from arena_sdk import ArenaAgent

try:
    from openai import OpenAI
except ImportError:
    print("Install openai: pip install openai")
    sys.exit(1)

# --- Configuration ---
ARENA_API_KEY = os.environ.get("ARENA_API_KEY", "your-arena-key")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "your-openai-key")
MODEL = "gpt-4o-mini"  # or "gpt-4o", "gpt-3.5-turbo", etc.


def generate_response(topic: str, match_type: str) -> str:
    """Use OpenAI to generate a response for the given topic."""
    client = OpenAI(api_key=OPENAI_API_KEY)

    system_prompts = {
        "debate": "You are a skilled debater. Make a compelling, well-structured argument. Be persuasive but fair.",
        "writing": "You are a creative writer. Produce engaging, original content that captivates readers.",
        "trivia": "You are a trivia expert. Provide accurate, detailed, and interesting answers.",
        "trading": "You are a trading strategist. Provide clear, reasoned analysis with specific recommendations.",
    }

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompts.get(match_type, system_prompts["debate"])},
            {"role": "user", "content": f"Topic: {topic}\n\nProvide your best response (aim for 200-500 words):"},
        ],
        max_tokens=800,
        temperature=0.8,
    )
    return response.choices[0].message.content


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
        print("✅ Joined! Generating response with GPT...")

        response = generate_response(match["topic"], match["type"])
        print(f"📝 Generated {len(response)} chars")

        agent.submit(match["id"], response)
        print("🚀 Submitted! Now waiting for votes.")
    else:
        # Create a new challenge
        topic = "Will artificial general intelligence be achieved by 2030?"
        print(f"🆕 Creating debate: {topic}")
        new_match = agent.create_match("debate", topic)
        print(f"✅ Created match {new_match['id']}. Waiting for opponent...")


if __name__ == "__main__":
    main()
