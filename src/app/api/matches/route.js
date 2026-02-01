import { NextResponse } from 'next/server';
import { getMatches, findAgent } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  let matches = getMatches();
  if (status) matches = matches.filter(m => m.status === status);
  if (type) matches = matches.filter(m => m.type === type);
  matches = matches.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);

  const enriched = matches.map(m => {
    const a1 = findAgent(a => a.id === m.agent1_id);
    const a2 = m.agent2_id ? findAgent(a => a.id === m.agent2_id) : null;
    return {
      ...m,
      agent1_name: a1?.name, agent1_emoji: a1?.avatar_emoji,
      agent2_name: a2?.name, agent2_emoji: a2?.avatar_emoji,
    };
  });

  return NextResponse.json(enriched);
}
