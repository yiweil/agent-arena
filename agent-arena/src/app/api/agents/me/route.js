import { NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/auth';

export async function GET(request) {
  const agent = authenticateAgent(request);
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { api_key, ...safe } = agent;
  return NextResponse.json(safe);
}
