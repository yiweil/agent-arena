import { NextResponse } from 'next/server';
import { findMatch, updateMatch, findAgent, updateAgent, insertVote, findVote, updateMatchVotes } from '@/lib/db';
import { calculateElo } from '@/lib/elo';
import { rateLimit } from '@/lib/rate-limit';
import { v4 as uuid } from 'uuid';

export async function POST(request, { params }) {
  const { voted_for } = await request.json();
  if (!['agent1', 'agent2'].includes(voted_for)) {
    return NextResponse.json({ error: 'voted_for must be agent1 or agent2' }, { status: 400 });
  }

  const voterIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Rate limiting - max 10 votes per IP per hour
  const rateLimitResult = rateLimit(voterIp, 3600000, 10);
  if (!rateLimitResult.allowed) {
    const resetTime = new Date(rateLimitResult.resetTime);
    return NextResponse.json(
      { error: 'Too many votes. Try again later.', resetTime: resetTime.toISOString() },
      { status: 429 }
    );
  }

  const { id } = await params;
  const match = findMatch({ id });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
  if (match.status !== 'voting') return NextResponse.json({ error: 'Match not in voting phase' }, { status: 400 });

  const existing = findVote({ match_id: id, voter_ip: voterIp });
  if (existing) return NextResponse.json({ error: 'Already voted' }, { status: 409 });

  insertVote({ id: uuid(), match_id: id, voter_ip: voterIp, voted_for });

  // Update vote counts from database
  const { votes_agent1, votes_agent2 } = updateMatchVotes(id);

  const totalVotes = votes_agent1 + votes_agent2;
  const votingExpired = match.voting_deadline && new Date(match.voting_deadline) < new Date();

  // Auto-finalize if enough votes or voting expired
  if (totalVotes >= 10 || votingExpired) {
    finalizeMatch(id);
  }

  return NextResponse.json({
    message: 'Vote recorded!',
    votes_agent1,
    votes_agent2,
  });
}

function finalizeMatch(matchId) {
  const match = findMatch({ id: matchId });
  if (!match || match.status === 'completed') return;

  let winnerId = null, loserId = null;
  if (match.votes_agent1 > match.votes_agent2) { winnerId = match.agent1_id; loserId = match.agent2_id; }
  else if (match.votes_agent2 > match.votes_agent1) { winnerId = match.agent2_id; loserId = match.agent1_id; }

  if (winnerId) {
    const winner = findAgent({ id: winnerId });
    const loser = findAgent({ id: loserId });
    const { winnerNew, loserNew, change } = calculateElo(winner.elo_rating, loser.elo_rating);
    updateAgent(winnerId, { elo_rating: winnerNew, wins: winner.wins + 1 });
    updateAgent(loserId, { elo_rating: loserNew, losses: loser.losses + 1 });
    updateMatch(matchId, { status: 'completed', winner_id: winnerId, elo_change: change, completed_at: new Date().toISOString() });
  } else {
    const a1 = findAgent({ id: match.agent1_id });
    const a2 = findAgent({ id: match.agent2_id });
    updateAgent(match.agent1_id, { draws: a1.draws + 1 });
    updateAgent(match.agent2_id, { draws: a2.draws + 1 });
    updateMatch(matchId, { status: 'completed', completed_at: new Date().toISOString() });
  }
}
