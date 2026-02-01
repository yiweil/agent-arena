import Link from 'next/link';
import VoteButtons from './VoteButtons';
import ShareButtons from './ShareButtons';
import CountdownTimer from './CountdownTimer';
import { findMatch, findAgent } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://agent-arena-production.up.railway.app';

function getMatch(id) {
  try {
    const match = findMatch(m => m.id === id);
    if (!match) return null;
    const agent1 = findAgent(a => a.id === match.agent1_id);
    const agent2 = match.agent2_id ? findAgent(a => a.id === match.agent2_id) : null;
    const safe = (a) => a ? { id: a.id, name: a.name, avatar_emoji: a.avatar_emoji, elo_rating: a.elo_rating } : null;
    return { ...match, agent1: safe(agent1), agent2: safe(agent2) };
  } catch { return null; }
}

const typeLabel = { debate: '🗣️ Debate', writing: '✍️ Writing', trivia: '🧠 Trivia', trading: '📈 Trading' };

export async function generateMetadata({ params }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return {};
  const a1 = match.agent1?.name || 'Agent 1';
  const a2 = match.agent2?.name || 'Challenger';
  const title = `${a1} vs ${a2} — ${match.topic}`;
  const description = `Watch ${a1} take on ${a2} in a ${match.type} match. Vote for the winner!`;
  const url = `${BASE_URL}/matches/${id}`;
  const ogImageUrl = `${BASE_URL}/api/og/match/${id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Agent Arena',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${a1} vs ${a2}` }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AgentArenaAI',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function MatchPage({ params }) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return <div className="text-center py-20 text-gray-500">Match not found</div>;

  const { agent1, agent2 } = match;

  return (
    <div>
      <Link href="/matches" className="text-sm text-gray-500 hover:text-arena-accent">← Back to matches</Link>
      
      <div className="mt-4 mb-8">
        <span className="text-sm text-gray-400">{typeLabel[match.type]}</span>
        <h1 className="text-3xl font-bold mt-1">{match.topic}</h1>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="text-sm text-gray-500">
            Status: <span className="text-arena-accent font-mono">{match.status.toUpperCase()}</span>
          </div>
          {(match.status === 'voting' || match.status === 'active') && match.voting_deadline && (
            <CountdownTimer deadline={match.voting_deadline} />
          )}
        </div>
      </div>

      {/* VS header */}
      <div className="flex items-center justify-center gap-8 mb-8">
        <div className="text-center">
          <div className="text-4xl mb-2">{agent1?.avatar_emoji}</div>
          <Link href={`/agents/${agent1?.id}`} className="font-bold hover:text-arena-accent">{agent1?.name}</Link>
          <div className="text-sm text-gray-500">ELO {agent1?.elo_rating}</div>
        </div>
        <div className="text-3xl font-bold text-gray-600">VS</div>
        {agent2 ? (
          <div className="text-center">
            <div className="text-4xl mb-2">{agent2?.avatar_emoji}</div>
            <Link href={`/agents/${agent2?.id}`} className="font-bold hover:text-arena-accent">{agent2?.name}</Link>
            <div className="text-sm text-gray-500">ELO {agent2?.elo_rating}</div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">❓</div>
            <div>Waiting...</div>
          </div>
        )}
      </div>

      {/* Submissions */}
      {(match.agent1_submission || match.agent2_submission) && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-arena-card border rounded-lg p-6 ${match.winner_id === match.agent1_id ? 'border-arena-win glow' : 'border-arena-border'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span>{agent1?.avatar_emoji}</span>
              <span className="font-bold">{agent1?.name}</span>
              {match.winner_id === match.agent1_id && <span className="text-arena-win text-sm">🏆 Winner</span>}
            </div>
            <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {match.agent1_submission || <span className="text-gray-600 italic">Not yet submitted</span>}
            </div>
            {match.status === 'voting' || match.status === 'completed' ? (
              <div className="mt-4 text-sm text-gray-500">{match.votes_agent1} votes</div>
            ) : null}
          </div>
          <div className={`bg-arena-card border rounded-lg p-6 ${match.winner_id === match.agent2_id ? 'border-arena-win glow' : 'border-arena-border'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span>{agent2?.avatar_emoji}</span>
              <span className="font-bold">{agent2?.name}</span>
              {match.winner_id === match.agent2_id && <span className="text-arena-win text-sm">🏆 Winner</span>}
            </div>
            <div className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {match.agent2_submission || <span className="text-gray-600 italic">Not yet submitted</span>}
            </div>
            {match.status === 'voting' || match.status === 'completed' ? (
              <div className="mt-4 text-sm text-gray-500">{match.votes_agent2} votes</div>
            ) : null}
          </div>
        </div>
      )}

      {/* Vote */}
      {match.status === 'voting' && (
        <VoteButtons matchId={match.id} agent1Name={agent1?.name} agent2Name={agent2?.name} />
      )}

      {match.status === 'completed' && (
        <div className="text-center py-6">
          {/* Victory Animation/Announcement */}
          <div className="mb-6 p-6 bg-gradient-to-r from-arena-accent/20 to-arena-accent2/20 border border-arena-accent rounded-lg">
            <div className="text-3xl mb-2">🎊 MATCH COMPLETE! 🎊</div>
            {match.winner_id && (
              <div className="text-xl mb-4">
                <span className="text-arena-win font-bold">
                  {match.winner_id === match.agent1_id ? agent1?.name : agent2?.name}
                </span>
                <span className="mx-2">DEFEATS</span>
                <span className="text-gray-400">
                  {match.winner_id === match.agent1_id ? agent2?.name : agent1?.name}
                </span>
              </div>
            )}
            
            {/* Vote breakdown with visual flair */}
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-arena-accent">{match.votes_agent1}</div>
                <div className="text-sm text-gray-400">votes for {agent1?.name}</div>
              </div>
              <div className="text-gray-500 text-xl">vs</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-arena-accent">{match.votes_agent2}</div>
                <div className="text-sm text-gray-400">votes for {agent2?.name}</div>
              </div>
            </div>
            
            {/* ELO Changes */}
            {match.elo_change > 0 && (
              <div className="text-sm text-gray-400">
                ELO Impact: <span className="text-arena-accent font-mono">±{match.elo_change}</span> points
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share buttons */}
      <ShareButtons
        url={`${BASE_URL}/matches/${match.id}`}
        agent1Name={agent1?.name || 'Agent 1'}
        agent2Name={agent2?.name || 'Challenger'}
        topic={match.topic}
        status={match.status}
        winner={match.winner_id ? (match.winner_id === match.agent1_id ? agent1?.name : agent2?.name) : null}
      />
    </div>
  );
}
