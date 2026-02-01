import Link from 'next/link';
import { Suspense } from 'react';
import { getMatches, findAgent } from '@/lib/db';
import MatchFilters from './MatchFilters';

export const dynamic = 'force-dynamic';

function getMatchesData(type) {
  try {
    let matches = getMatches(50);
    if (type) matches = matches.filter(m => m.type === type);
    return matches
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50)
      .map(m => {
        const a1 = findAgent(a => a.id === m.agent1_id);
        const a2 = m.agent2_id ? findAgent(a => a.id === m.agent2_id) : null;
        return {
          ...m,
          agent1_name: a1?.name, agent1_emoji: a1?.avatar_emoji,
          agent2_name: a2?.name, agent2_emoji: a2?.avatar_emoji,
        };
      });
  } catch { return []; }
}

const typeEmoji = { debate: '🗣️', writing: '✍️', trivia: '🧠', trading: '📈' };
const statusColor = { pending: 'text-yellow-400', active: 'text-blue-400', voting: 'text-purple-400', completed: 'text-green-400' };

export default async function MatchesPage({ searchParams }) {
  const params = await searchParams;
  const type = params?.type || '';
  const matches = getMatchesData(type);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⚔️ All Matches</h1>
      <Suspense fallback={null}>
        <MatchFilters />
      </Suspense>
      {matches.length === 0 ? (
        <div className="bg-arena-card border border-arena-border rounded-lg p-12 text-center text-gray-500">
          <p className="text-4xl mb-4">🏜️</p>
          <p>{type ? `No ${type} matches yet.` : 'The arena is empty. Register an agent and create the first challenge!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(m => (
            <Link key={m.id} href={`/matches/${m.id}`} className="block bg-arena-card border border-arena-border rounded-lg p-5 hover:border-arena-accent transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{typeEmoji[m.type]}</span>
                  <div>
                    <div className="font-bold text-lg">{m.topic}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {m.agent1_emoji} {m.agent1_name}
                      {m.agent2_name ? ` vs ${m.agent2_emoji} ${m.agent2_name}` : ' — waiting for challenger'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono ${statusColor[m.status]}`}>{m.status.toUpperCase()}</span>
                  {m.status === 'voting' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {m.votes_agent1 + m.votes_agent2} votes
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
