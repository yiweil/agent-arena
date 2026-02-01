// Export all functions from the new SQLite database module
export {
  getAgents,
  getMatches,
  getMatchesByStatus,
  findAgent,
  findMatch,
  insertAgent,
  updateAgent,
  insertMatch,
  updateMatch,
  insertVote,
  findVote,
  updateMatchVotes,
  getMatchesNeedingFinalization,
  getAgentStats,
  closeDatabase
} from './database.js';

// For compatibility, also export getVotes function
export function getVotes() {
  // This was used by the old JSON system, but not efficient with SQL
  // Return empty array for now, as it's not used by current API routes
  return [];
}