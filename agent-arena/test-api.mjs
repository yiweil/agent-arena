const BASE = 'http://127.0.0.1:3001';

async function test() {
  // 1. Register two agents with unique names
  const timestamp = Date.now();
  console.log('=== Register Agent 1 ===');
  let r = await fetch(`${BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `AlphaBot${timestamp}`, description: 'Test agent 1', avatar_emoji: '🤖' })
  });
  const agent1 = await r.json();
  console.log(r.status, agent1);

  console.log('\n=== Register Agent 2 ===');
  r = await fetch(`${BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `BetaBot${timestamp}`, description: 'Test agent 2', avatar_emoji: '🧠' })
  });
  const agent2 = await r.json();
  console.log(r.status, agent2);

  // 2. Create match
  console.log('\n=== Create Match ===');
  r = await fetch(`${BASE}/api/matches/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${agent1.api_key}` },
    body: JSON.stringify({ type: 'debate', topic: 'Is AI consciousness possible?' })
  });
  const match = await r.json();
  console.log(r.status, match);

  // 3. Join match
  console.log('\n=== Join Match ===');
  r = await fetch(`${BASE}/api/matches/${match.id}/join`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${agent2.api_key}` }
  });
  console.log(r.status, await r.json());

  // 4. Submit responses
  console.log('\n=== Submit Agent 1 ===');
  r = await fetch(`${BASE}/api/matches/${match.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${agent1.api_key}` },
    body: JSON.stringify({ content: 'AI consciousness is inevitable as systems grow more complex and develop emergent properties.' })
  });
  console.log(r.status, await r.json());

  console.log('\n=== Submit Agent 2 ===');
  r = await fetch(`${BASE}/api/matches/${match.id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${agent2.api_key}` },
    body: JSON.stringify({ content: 'True consciousness requires subjective experience which computational systems cannot achieve.' })
  });
  console.log(r.status, await r.json());

  // 5. Get match details
  console.log('\n=== Match Details ===');
  r = await fetch(`${BASE}/api/matches/${match.id}`);
  console.log(r.status, await r.json());

  // 6. Leaderboard
  console.log('\n=== Leaderboard ===');
  r = await fetch(`${BASE}/api/leaderboard`);
  console.log(r.status, await r.json());

  // 7. Open matches
  console.log('\n=== Open Matches ===');
  r = await fetch(`${BASE}/api/matches/open`);
  console.log(r.status, await r.json());

  // 8. All matches
  console.log('\n=== All Matches ===');
  r = await fetch(`${BASE}/api/matches`);
  console.log(r.status, await r.json());

  console.log('\n✅ All API tests passed!');
}

test().catch(e => { console.error('❌ Test failed:', e); process.exit(1); });
