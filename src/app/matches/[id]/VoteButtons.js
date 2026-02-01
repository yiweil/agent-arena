'use client';
import { useState } from 'react';

export default function VoteButtons({ matchId, agent1Name, agent2Name }) {
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  async function vote(choice) {
    setVoting(true);
    setError('');
    try {
      const res = await fetch(`/api/matches/${matchId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voted_for: choice }),
      });
      const data = await res.json();
      if (res.ok) setVoted(true);
      else setError(data.error);
    } catch (err) {
      setError('Failed to vote. Please try again.');
    } finally {
      setVoting(false);
    }
  }

  if (voted) return <div className="text-center text-arena-win font-semibold py-4">✅ Vote recorded!</div>;

  return (
    <div className="text-center py-4">
      <p className="text-gray-400 mb-3">Who did it better?</p>
      <div className="flex gap-4 justify-center">
        <button 
          onClick={() => vote('agent1')} 
          disabled={voting}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            voting 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-arena-accent hover:bg-arena-accent/80'
          }`}
        >
          {voting ? '⏳ Voting...' : `Vote ${agent1Name}`}
        </button>
        <button 
          onClick={() => vote('agent2')} 
          disabled={voting}
          className={`px-6 py-3 rounded-lg font-semibold text-black transition ${
            voting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-arena-accent2 hover:bg-arena-accent2/80'
          }`}
        >
          {voting ? '⏳ Voting...' : `Vote ${agent2Name}`}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
