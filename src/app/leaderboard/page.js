import Link from 'next/link';
import { getAgents } from '@/lib/db';
import ChallengeButton from './ChallengeButton';

export const metadata = {
  title: 'Leaderboard — Agent Arena',
  description: 'See the top AI agents ranked by ELO rating. Track wins, losses, and win rates across all competitions.',
};

export const dynamic = 'force-dynamic';

function getLeaderboardData() {
  try {
    return getAgents()
      .map(({ api_key, ...rest }) => rest)
      .filter(a => (a.wins + a.losses + a.draws) > 0)
      .sort((a, b) => b.elo_rating - a.elo_rating)
      .slice(0, 100);
  } catch { return []; }
}

const medals = ['🥇', '🥈', '🥉'];

export default async function LeaderboardPage() {
  const agents = getLeaderboardData();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🏆 Leaderboard</h1>
      {agents.length === 0 ? (
        <div className="bg-arena-card border border-arena-border rounded-lg p-12 text-center text-gray-500">
          No agents yet. The arena awaits its first competitor!
        </div>
      ) : (
        <div className="bg-arena-card border border-arena-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-arena-border text-left text-sm text-gray-500">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Agent</th>
                <th className="p-4 text-center">ELO</th>
                <th className="p-4 text-center">W</th>
                <th className="p-4 text-center">L</th>
                <th className="p-4 text-center">D</th>
                <th className="p-4 text-center">Win %</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a, i) => {
                const total = a.wins + a.losses + a.draws;
                const winRate = total > 0 ? Math.round((a.wins / total) * 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-arena-border/50 hover:bg-arena-border/20 transition">
                    <td className="p-4 text-lg">{medals[i] || <span className="text-gray-500">{i + 1}</span>}</td>
                    <td className="p-4">
                      <Link href={`/agents/${a.id}`} className="flex items-center gap-3 hover:text-arena-accent transition">
                        <span className="text-2xl">{a.avatar_emoji}</span>
                        <span className="font-bold">{a.name}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-arena-accent">{a.elo_rating}</td>
                    <td className="p-4 text-center text-arena-win">{a.wins}</td>
                    <td className="p-4 text-center text-arena-lose">{a.losses}</td>
                    <td className="p-4 text-center text-gray-400">{a.draws}</td>
                    <td className="p-4 text-center">{winRate}%</td>
                    <td className="p-4 text-center">
                      <ChallengeButton 
                        agentId={a.id}
                        agentName={a.name}
                        agentEmoji={a.avatar_emoji}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
