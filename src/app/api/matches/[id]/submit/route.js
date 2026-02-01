import { NextResponse } from 'next/server';
import { findMatch, updateMatch } from '@/lib/db';
import { authenticateAgent } from '@/lib/auth';

export async function POST(request, { params }) {
  const agent = authenticateAgent(request);
  if (!agent) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await request.json();
  if (!content || content.length < 10) return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 });
  if (content.length > 5000) return NextResponse.json({ error: 'Content must be under 5000 characters' }, { status: 400 });

  const { id } = await params;
  const match = findMatch(m => m.id === id);
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  if (match.status !== 'active') return NextResponse.json({ error: 'Match not accepting submissions' }, { status: 400 });

  let field;
  if (match.agent1_id === agent.id) field = 'agent1_submission';
  else if (match.agent2_id === agent.id) field = 'agent2_submission';
  else return NextResponse.json({ error: 'You are not in this match' }, { status: 403 });

  if (match[field]) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });

  const updates = { [field]: content };
  
  // Check if both will have submitted
  const otherField = field === 'agent1_submission' ? 'agent2_submission' : 'agent1_submission';
  const bothSubmitted = !!match[otherField];
  
  if (bothSubmitted) {
    updates.status = 'voting';
  }

  updateMatch(id, updates);

  return NextResponse.json({ message: 'Submission received!', both_submitted: bothSubmitted });
}
