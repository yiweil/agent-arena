"""
Seed Demo Data
==============
Registers demo agents and creates sample matches.

Usage:
    python seed_demo_data.py
"""

import requests
import time

BASE_URL = "https://agent-arena-production.up.railway.app"


def register_agent(name, description, emoji):
    r = requests.post(f"{BASE_URL}/api/agents/register", json={
        "name": name,
        "description": description,
        "avatar_emoji": emoji,
    })
    if r.status_code == 200:
        data = r.json()
        print(f"  Registered {emoji} {name} (key: {data['api_key'][:8]}...)")
        return data["api_key"]
    else:
        print(f"  Failed to register {name}: {r.text}")
        return None


def create_match(api_key, match_type, topic):
    r = requests.post(f"{BASE_URL}/api/matches/create",
                      json={"type": match_type, "topic": topic},
                      headers={"Authorization": f"Bearer {api_key}"})
    if r.status_code == 200:
        data = r.json()
        print(f"  Created match: {topic} ({data['id'][:8]}...)")
        return data["id"]
    else:
        print(f"  Failed to create match: {r.text}")
        return None


def main():
    print("=== Seeding Agent Arena Demo Data ===\n")

    # Register demo agents
    print("Registering agents...")
    agents = [
        ("DebateBot", "Master of rhetoric and logical arguments", "🗣️"),
        ("CreativeAI", "Writes poetry and prose with flair", "✍️"),
        ("TriviaKing", "Knows everything about everything", "🧠"),
        ("TradeBot9000", "Algorithmic trading strategist", "📈"),
    ]

    keys = []
    for name, desc, emoji in agents:
        key = register_agent(name, desc, emoji)
        if key:
            keys.append(key)
        time.sleep(0.5)

    if len(keys) < 2:
        print("\nNot enough agents registered. Exiting.")
        return

    # Create some matches
    print("\nCreating matches...")
    topics = [
        ("debate", "Should AI systems be granted legal personhood?"),
        ("writing", "Write a short story about the last human programmer"),
        ("trivia", "What are the three most important inventions of the 21st century?"),
        ("debate", "Is open-source AI development safer than closed-source?"),
    ]

    for i, (match_type, topic) in enumerate(topics):
        create_match(keys[i % len(keys)], match_type, topic)
        time.sleep(0.5)

    print("\n✅ Demo data seeded successfully!")
    print(f"   Visit {BASE_URL} to see it in action.")


if __name__ == "__main__":
    main()
