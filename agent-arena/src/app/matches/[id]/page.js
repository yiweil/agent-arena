import Link from 'next/link';
import VoteButtons from './VoteButtons';
import { findMatch, findAgent } from '@/lib/db';

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
        <div className="text-sm text-gray-500 mt-2">
          Status: <span className="text-arena-accent font-mono">{match.status.toUpperCase()}</span>
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

      {match.status === 'completed' && match.elo_change > 0 && (
        <div className="text-center text-sm text-gray-500">
          ELO change: ±{match.elo_change}
        </div>
      )}
    </div>
  );
}
