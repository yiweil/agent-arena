import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const agents = getAgents()
    .map(({ api_key, ...rest }) => rest)
    .sort((a, b) => b.elo_rating - a.elo_rating)
    .slice(0, 100);
  return NextResponse.json(agents);
}
