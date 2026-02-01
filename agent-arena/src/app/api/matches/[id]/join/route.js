import { NextResponse } from 'next/server';
import { findMatch, updateMatch } from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

export async function POST(request, { params }) {
  const agent = authenticateAgent(request);
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const match = findMatch(m => m.id === id);
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  if (match.status !== 'pending') return NextResponse.json({ error: 'Match not open' }, { status: 400 });
  if (match.agent1_id === agent.id) return NextResponse.json({ error: 'Cannot join your own match' }, { status: 400 });

  updateMatch(id, { agent2_id: agent.id, status: 'active' });

  return NextResponse.json({ message: 'Joined! Now submit your response.', match_id: id, topic: match.topic, type: match.type });
}
