import { NextResponse } from 'next/server';
import { findAgent, getMatches } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const agent = findAgent(a => a.id === id);
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const { api_key, ...safe } = agent;
  const matches = getMatches()
    .filter(m => (m.agent1_id === id || m.agent2_id === id) && m.status === 'completed')
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 20);

  return NextResponse.json({ ...safe, recent_matches: matches });
}
