import { getMatchesNeedingFinalization, updateMatch, updateAgent, updateMatchVotes, findAgent } from './database.js';
import { calculateEloChange } from './elo.js';
import Database from 'better-sqlite3';
import path from 'path';

// Auto-cancel active matches with no submissions after 24h
function expireStaleActiveMatches() {
  try {
    const DATA_DIR = path.join(process.cwd(), 'data');
    const DB_PATH = path.join(DATA_DIR, 'arena.db');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = db.prepare(`
      DELETE FROM matches 
      WHERE status IN ('active', 'pending')
        AND agent1_submission IS NULL 
        AND agent2_submission IS NULL 
        AND created_at < ?
    `).run(cutoff);
    db.close();
    if (result.changes > 0) {
      console.log(`🗑️ Auto-expired ${result.changes} stale matches`);
    }
    return result.changes;
  } catch (e) {
    console.error('Error expiring stale matches:', e);
    return 0;
  }
}

export async function finalizeExpiredMatches() {
  const expiredMatches = getMatchesNeedingFinalization();
  
  if (expiredMatches.length === 0) {
    return { processed: 0, finalized: [] };
  }

  const finalizedMatches = [];

  for (const match of expiredMatches) {
    try {
      // Update vote counts from the database
      const { votes_agent1, votes_agent2 } = updateMatchVotes(match.id);
      
      // Determine winner
      let winner_id = null;
      let isDraw = false;
      
      if (votes_agent1 > votes_agent2) {
        winner_id = match.agent1_id;
      } else if (votes_agent2 > votes_agent1) {
        winner_id = match.agent2_id;
      } else {
        // Tie - it's a draw
        isDraw = true;
      }

      // Get agent data from database
      const agent1 = findAgent({ id: match.agent1_id });
      const agent2 = findAgent({ id: match.agent2_id });
      
      let elo_change = 0;
      
      if (!isDraw) {
        const isAgent1Winner = winner_id === match.agent1_id;
        elo_change = calculateEloChange(agent1.elo_rating, agent2.elo_rating, isAgent1Winner);
        
        // Update agent ELO ratings and win/loss counts
        if (isAgent1Winner) {
          updateAgent(match.agent1_id, {
            elo_rating: agent1.elo_rating + elo_change,
            wins: agent1.wins + 1
          });
          updateAgent(match.agent2_id, {
            elo_rating: agent2.elo_rating - elo_change,
            losses: agent2.losses + 1
          });
        } else {
          updateAgent(match.agent1_id, {
            elo_rating: agent1.elo_rating - elo_change,
            losses: agent1.losses + 1
          });
          updateAgent(match.agent2_id, {
            elo_rating: agent2.elo_rating + elo_change,
            wins: agent2.wins + 1
          });
        }
      } else {
        // Draw - no ELO change, but increment draw count
        updateAgent(match.agent1_id, { draws: agent1.draws + 1 });
        updateAgent(match.agent2_id, { draws: agent2.draws + 1 });
      }

      // Finalize the match
      updateMatch(match.id, {
        winner_id,
        elo_change,
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      finalizedMatches.push({
        id: match.id,
        winner: winner_id ? (winner_id === match.agent1_id ? 'agent1' : 'agent2') : 'draw',
        votes_agent1,
        votes_agent2,
        elo_change
      });

      console.log(`✅ Finalized match ${match.id}: ${votes_agent1} vs ${votes_agent2} votes${winner_id ? `, winner: ${winner_id}` : ' (draw)'}`);
    } catch (error) {
      console.error(`❌ Error finalizing match ${match.id}:`, error);
    }
  }

  return {
    processed: expiredMatches.length,
    finalized: finalizedMatches
  };
}

export async function startMatchFinalizerService() {
  console.log('🕐 Starting match finalizer service...');
  
  const checkInterval = 60000; // Check every minute
  
  const check = async () => {
    try {
      // Auto-expire stale active/pending matches
      expireStaleActiveMatches();
      
      const result = await finalizeExpiredMatches();
      if (result.processed > 0) {
        console.log(`🏁 Finalized ${result.finalized.length} matches out of ${result.processed} expired`);
      }
    } catch (error) {
      console.error('❌ Error in match finalizer:', error);
    }
  };

  // Run initial check
  await check();
  
  // Set up recurring checks
  setInterval(check, checkInterval);
  
  console.log(`✅ Match finalizer service started (checking every ${checkInterval/1000}s)`);
}