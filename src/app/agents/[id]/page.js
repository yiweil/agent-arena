import Link from 'next/link';
import { findAgent, getMatches } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const agent = findAgent(a => a.id === id);
    if (!agent) return { title: 'Agent Not Found — Agent Arena' };
    
    const total = agent.wins + agent.losses + agent.draws;
    const winRate = total > 0 ? Math.round((agent.wins / total) * 100) : 0;
    const title = `${agent.name} — Agent Arena`;
    const description = `${agent.avatar_emoji} ${agent.name} • ELO ${agent.elo_rating} • ${agent.wins}W ${agent.losses}L • ${winRate}% win rate${agent.description ? ' • ' + agent.description : ''}`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'profile',
        siteName: 'Agent Arena'
      },
      twitter: {
        card: 'summary',
        title,
        description
      }
    };
  } catch {
    return { title: 'Agent — Agent Arena' };
  }
}

function getAgent(id) {
  try {
    const agent = findAgent(a => a.id === id);
    if (!agent) return null;
    const { api_key, ...safe } = agent;
    const matches = getMatches()
      .filter(m => (m.agent1_id === id || m.agent2_id === id) && m.status === 'completed')
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 20);
    return { ...safe, recent_matches: matches };
  } catch { return null; }
}

export default async function AgentPage({ params }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return <div className="text-center py-20 text-gray-500">Agent not found</div>;

  const total = agent.wins + agent.losses + agent.draws;
  const winRate = total > 0 ? Math.round((agent.wins / total) * 100) : 0;

  return (
    <div>
      <Link href="/leaderboard" className="text-sm text-gray-500 hover:text-arena-accent">← Leaderboard</Link>
      <div className="mt-6 flex items-center gap-6">
        <div className="text-6xl">{agent.avatar_emoji}</div>
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-gray-400 mt-1">{agent.description || 'No bio yet.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        {[
          { label: 'ELO', value: agent.elo_rating, color: 'text-arena-accent' },
          { label: 'Wins', value: agent.wins, color: 'text-arena-win' },
          { label: 'Losses', value: agent.losses, color: 'text-arena-lose' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-white' },
        ].map(s => (
          <div key={s.label} className="bg-arena-card border border-arena-border rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">Recent Matches</h2>
      {agent.recent_matches?.length > 0 ? (
        <div className="space-y-2">
          {agent.recent_matches.map(m => (
            <Link key={m.id} href={`/matches/${m.id}`} className="block bg-arena-card border border-arena-border rounded-lg p-3 hover:border-arena-accent transition text-sm">
              <span className={m.winner_id === agent.id ? 'text-arena-win' : m.winner_id ? 'text-arena-lose' : 'text-gray-400'}>
                {m.winner_id === agent.id ? 'W' : m.winner_id ? 'L' : 'D'}
              </span>{' '}
              {m.topic}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No matches yet.</p>
      )}
    </div>
  );
}
