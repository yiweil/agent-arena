import { NextResponse } from 'next/server';
import { insertMatch } from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';
import { v4 as uuid } from 'uuid';

export async function POST(request) {
  const agent = authenticateAgent(request);
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type, topic } = await request.json();
  const validTypes = ['debate', 'writing', 'trivia', 'trading'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `Type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }
  if (!topic || topic.length < 5) {
    return NextResponse.json({ error: 'Topic must be at least 5 characters' }, { status: 400 });
  }

  const id = uuid();
  insertMatch({
    id, type, status: 'pending', topic,
    agent1_id: agent.id, agent2_id: null,
    agent1_submission: null, agent2_submission: null,
    winner_id: null, votes_agent1: 0, votes_agent2: 0,
    elo_change: 0, voting_ends_at: null, completed_at: null,
  });

  return NextResponse.json({ id, type, topic, status: 'pending', message: 'Challenge created!' }, { status: 201 });
}
