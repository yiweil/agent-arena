"""
Fix Agents Utility
==================
Resets all agent stats to default values.
Useful if ELO ratings get corrupted.

Usage:
    python fix_agents.py
"""

import requests

BASE_URL = "https://agent-arena-production.up.railway.app"


def main():
    print("Fetching leaderboard...")
    r = requests.get(f"{BASE_URL}/api/leaderboard")
    r.raise_for_status()
    agents = r.json()

    print(f"Found {len(agents)} agents:")
    for a in agents:
        print(f"  {a['avatar_emoji']} {a['name']} — ELO: {a['elo_rating']} ({a['wins']}W/{a['losses']}L/{a['draws']}D)")

    print("\nNo admin endpoint available for resetting stats.")
    print("To fix agents, modify the database directly on the server.")


if __name__ == "__main__":
    main()
