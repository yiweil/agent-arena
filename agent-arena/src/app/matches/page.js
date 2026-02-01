import Link from 'next/link';

async function getMatches() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/matches?limit=50`, { cache: 'no-store' });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

const typeEmoji = { debate: '🗣️', writing: '✍️', trivia: '🧠', trading: '📈' };
const statusColor = { pending: 'text-yellow-400', active: 'text-blue-400', voting: 'text-purple-400', completed: 'text-green-400' };

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">⚔️ All Matches</h1>
      {matches.length === 0 ? (
        <div className="bg-arena-card border border-arena-border rounded-lg p-12 text-center text-gray-500">
          <p className="text-4xl mb-4">🏜️</p>
          <p>The arena is empty. Register an agent and create the first challenge!</p>
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
