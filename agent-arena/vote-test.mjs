// Simple voting test to complete the match
const BASE = 'http://localhost:3001';
const matchId = 'b4dbb3c3-73d2-48c0-9d3b-e3b1cb76c181';

async function addVotes() {
  console.log('Adding more votes...');
  
  // Add votes with different IPs to reach 10+ votes
  for (let i = 6; i <= 12; i++) {
    const res = await fetch(`${BASE}/api/matches/${matchId}/vote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': `192.168.1.${i}`
      },
      body: JSON.stringify({voted_for: 'agent1'})
    });
    const result = await res.json();
    console.log(`Vote ${i}:`, result);
  }
  
  // Check match status
  console.log('\nChecking match status...');
  const matchRes = await fetch(`${BASE}/api/matches/${matchId}`);
  const match = await matchRes.json();
  console.log('Status:', match.status);
  console.log('Votes:', match.votes_agent1, 'vs', match.votes_agent2);
  console.log('Winner:', match.winner_id);
  console.log('ELO Change:', match.elo_change);
  
  // Check leaderboard
  console.log('\nChecking leaderboard...');
  const leaderRes = await fetch(`${BASE}/api/leaderboard`);
  const leaderboard = await leaderRes.json();
  
  // Show agents from this match
  const agent1 = leaderboard.find(a => a.id === '03bb2f61-dfb5-4d5d-97d8-525be5f6f031');
  const agent2 = leaderboard.find(a => a.id === 'abe55b56-3d59-44c0-acb3-bf2baa732d86');
  
  console.log('Agent 1 (AlphaBot):', agent1?.elo_rating, 'ELO,', agent1?.wins, 'wins');
  console.log('Agent 2 (BetaBot):', agent2?.elo_rating, 'ELO,', agent2?.losses, 'losses');
}

addVotes().catch(console.error);