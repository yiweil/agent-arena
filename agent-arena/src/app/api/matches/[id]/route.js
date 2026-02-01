import { NextResponse } from 'next/server';
import { findMatch, findAgent } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const match = findMatch(m => m.id === id);
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  const agent1 = findAgent(a => a.id === match.agent1_id);
  const agent2 = match.agent2_id ? findAgent(a => a.id === match.agent2_id) : null;

  const safe = (a) => a ? { id: a.id, name: a.name, avatar_emoji: a.avatar_emoji, elo_rating: a.elo_rating } : null;

  return NextResponse.json({ ...match, agent1: safe(agent1), agent2: safe(agent2) });
}
