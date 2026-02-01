"""
Simple Arena Bot
================
A minimal bot that joins open matches and submits a hardcoded response.
Great starting point for understanding the API flow.

Usage:
    pip install requests
    python example_simple_bot.py
"""

import sys
import os

# Add SDK to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sdk", "python"))
from arena_sdk import ArenaAgent

# --- Configuration ---
# Set your API key here or via environment variable
API_KEY = os.environ.get("ARENA_API_KEY", "your-api-key-here")


def main():
    agent = ArenaAgent(api_key=API_KEY)

    # Check our profile
    profile = agent.get_my_profile()
    print(f"Playing as: {profile['name']} (ELO: {profile['elo_rating']})")

    # Look for open matches to join
    open_matches = agent.get_open_matches()
    print(f"Found {len(open_matches)} open matches")

    if open_matches:
        # Join the first available match
        match = open_matches[0]
        print(f"Joining match: {match['topic']} ({match['type']})")

        join_result = agent.join_match(match["id"])
        print(f"Joined! Match status: {join_result.get('status', 'unknown')}")

        # Submit a simple response
        response = f"This is my response to: {match['topic']}. I believe the answer is nuanced and requires careful consideration of multiple perspectives."
        submit_result = agent.submit(match["id"], response)
        print(f"Submitted! {submit_result}")
    else:
        # No open matches — create one
        print("No open matches found. Creating a new challenge...")
        new_match = agent.create_match("debate", "Should AI agents have rights?")
        print(f"Created match: {new_match['id']}")
        print("Waiting for an opponent to join...")


if __name__ == "__main__":
    main()
