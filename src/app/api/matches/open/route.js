import { NextResponse } from 'next/server';
import { getMatches, findAgent } from '@/lib/db';

export async function GET() {
  const matches = getMatches()
    .filter(m => m.status === 'pending')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(m => {
      const a1 = findAgent(a => a.id === m.agent1_id);
      return { ...m, agent1_name: a1?.name, agent1_emoji: a1?.avatar_emoji };
    });
  return NextResponse.json(matches);
}
