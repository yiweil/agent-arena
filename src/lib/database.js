import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'arena.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    api_key TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    avatar_emoji TEXT NOT NULL DEFAULT '🤖',
    elo_rating INTEGER NOT NULL DEFAULT 1200,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('debate', 'writing', 'trivia', 'trading')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'voting', 'completed')),
    topic TEXT NOT NULL,
    agent1_id TEXT NOT NULL,
    agent2_id TEXT,
    agent1_submission TEXT,
    agent2_submission TEXT,
    winner_id TEXT,
    votes_agent1 INTEGER NOT NULL DEFAULT 0,
    votes_agent2 INTEGER NOT NULL DEFAULT 0,
    elo_change INTEGER,
    voting_deadline TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (agent1_id) REFERENCES agents(id),
    FOREIGN KEY (agent2_id) REFERENCES agents(id),
    FOREIGN KEY (winner_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    voter_ip TEXT NOT NULL,
    voted_for TEXT NOT NULL CHECK (voted_for IN ('agent1', 'agent2')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    UNIQUE(match_id, voter_ip)
  );

  CREATE INDEX IF NOT EXISTS idx_agents_elo ON agents(elo_rating DESC);
  CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
  CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_votes_match ON votes(match_id);
`);

// Prepared statements for better performance
const statements = {
  // Agents
  insertAgent: db.prepare(`
    INSERT INTO agents (id, name, api_key, description, avatar_emoji, elo_rating, wins, losses, draws, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findAgentById: db.prepare('SELECT * FROM agents WHERE id = ?'),
  findAgentByApiKey: db.prepare('SELECT * FROM agents WHERE api_key = ?'),
  findAgentByName: db.prepare('SELECT * FROM agents WHERE name = ?'),
  updateAgent: db.prepare('UPDATE agents SET elo_rating = ?, wins = ?, losses = ?, draws = ? WHERE id = ?'),
  getAllAgents: db.prepare('SELECT * FROM agents ORDER BY elo_rating DESC'),

  // Matches
  insertMatch: db.prepare(`
    INSERT INTO matches (id, type, status, topic, agent1_id, agent2_id, voting_deadline, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  findMatchById: db.prepare('SELECT * FROM matches WHERE id = ?'),
  updateMatchStatus: db.prepare('UPDATE matches SET status = ?, agent2_id = ? WHERE id = ?'),
  updateMatchSubmission: db.prepare('UPDATE matches SET agent1_submission = ?, agent2_submission = ?, status = ? WHERE id = ?'),
  updateMatchResult: db.prepare('UPDATE matches SET winner_id = ?, elo_change = ?, status = ?, completed_at = ? WHERE id = ?'),
  getMatchesByStatus: db.prepare('SELECT * FROM matches WHERE status = ? ORDER BY created_at DESC'),
  getAllMatches: db.prepare('SELECT * FROM matches ORDER BY created_at DESC LIMIT ?'),
  getMatchesByAgent: db.prepare('SELECT * FROM matches WHERE agent1_id = ? OR agent2_id = ? ORDER BY created_at DESC'),

  // Votes
  insertVote: db.prepare('INSERT INTO votes (id, match_id, voter_ip, voted_for, created_at) VALUES (?, ?, ?, ?, ?)'),
  findVote: db.prepare('SELECT * FROM votes WHERE match_id = ? AND voter_ip = ?'),
  getVotesForMatch: db.prepare('SELECT voted_for, COUNT(*) as count FROM votes WHERE match_id = ? GROUP BY voted_for'),
  updateMatchVotes: db.prepare('UPDATE matches SET votes_agent1 = ?, votes_agent2 = ? WHERE id = ?')
};

// Helper functions
export function getAgents() {
  return statements.getAllAgents.all();
}

export function getMatches(limit = 50) {
  return statements.getAllMatches.all(limit);
}

export function getMatchesByStatus(status) {
  return statements.getMatchesByStatus.all(status);
}

export function findAgent(predicate) {
  if (typeof predicate === 'function') {
    // For backward compatibility with existing code
    return getAgents().find(predicate) || null;
  }
  // If it's an object with properties, find by those properties
  if (predicate.id) return statements.findAgentById.get(predicate.id) || null;
  if (predicate.api_key) return statements.findAgentByApiKey.get(predicate.api_key) || null;
  if (predicate.name) return statements.findAgentByName.get(predicate.name) || null;
  return null;
}

export function findAgentById(id) {
  return statements.findAgentById.get(id) || null;
}

export function findMatch(predicate) {
  if (typeof predicate === 'function') {
    return getMatches().find(predicate) || null;
  }
  if (predicate.id) return statements.findMatchById.get(predicate.id) || null;
  return null;
}

export function insertAgent(agent) {
  const now = new Date().toISOString();
  return statements.insertAgent.run(
    agent.id, agent.name, agent.api_key, agent.description,
    agent.avatar_emoji, agent.elo_rating, agent.wins, agent.losses, agent.draws, now
  );
}

export function updateAgent(id, updates) {
  const agent = statements.findAgentById.get(id);
  if (!agent) return false;
  
  const newElo = updates.elo_rating ?? agent.elo_rating;
  const newWins = updates.wins ?? agent.wins;
  const newLosses = updates.losses ?? agent.losses;
  const newDraws = updates.draws ?? agent.draws;
  
  return statements.updateAgent.run(newElo, newWins, newLosses, newDraws, id);
}

export function insertMatch(match) {
  const now = new Date().toISOString();
  const votingDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
  
  return statements.insertMatch.run(
    match.id, match.type, match.status, match.topic,
    match.agent1_id, match.agent2_id || null, votingDeadline, now
  );
}

export function updateMatch(id, updates) {
  const match = statements.findMatchById.get(id);
  if (!match) return false;
  
  try {
    // Build update query dynamically to avoid conflicts
    const setClause = [];
    const params = [];
    
    if (updates.status !== undefined) {
      setClause.push('status = ?');
      params.push(updates.status);
    }
    if (updates.agent2_id !== undefined) {
      setClause.push('agent2_id = ?');
      params.push(updates.agent2_id);
    }
    if (updates.agent1_submission !== undefined) {
      setClause.push('agent1_submission = ?');
      params.push(updates.agent1_submission);
    }
    if (updates.agent2_submission !== undefined) {
      setClause.push('agent2_submission = ?');
      params.push(updates.agent2_submission);
    }
    if (updates.winner_id !== undefined) {
      setClause.push('winner_id = ?');
      params.push(updates.winner_id);
    }
    if (updates.elo_change !== undefined) {
      setClause.push('elo_change = ?');
      params.push(updates.elo_change);
    }
    if (updates.completed_at !== undefined) {
      setClause.push('completed_at = ?');
      params.push(updates.completed_at);
    }
    
    if (setClause.length === 0) return true;
    
    const sql = `UPDATE matches SET ${setClause.join(', ')} WHERE id = ?`;
    params.push(id);
    
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    
    // Auto-update status to voting if both submissions are present
    if (updates.agent1_submission !== undefined || updates.agent2_submission !== undefined) {
      const updatedMatch = statements.findMatchById.get(id);
      if (updatedMatch && updatedMatch.agent1_submission && updatedMatch.agent2_submission && updatedMatch.status !== 'voting' && updatedMatch.status !== 'completed') {
        db.prepare('UPDATE matches SET status = ? WHERE id = ?').run('voting', id);
      }
    }
    
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating match:', error);
    return false;
  }
}

export function insertVote(vote) {
  const now = new Date().toISOString();
  return statements.insertVote.run(vote.id, vote.match_id, vote.voter_ip, vote.voted_for, now);
}

export function findVote(predicate) {
  if (typeof predicate === 'function') {
    // This is inefficient but maintains backward compatibility
    const allVotes = db.prepare('SELECT * FROM votes').all();
    return allVotes.find(predicate) || null;
  }
  if (predicate.match_id && predicate.voter_ip) {
    return statements.findVote.get(predicate.match_id, predicate.voter_ip) || null;
  }
  return null;
}

export function updateMatchVotes(matchId) {
  const votes = statements.getVotesForMatch.all(matchId);
  let votes_agent1 = 0;
  let votes_agent2 = 0;
  
  votes.forEach(v => {
    if (v.voted_for === 'agent1') votes_agent1 = v.count;
    if (v.voted_for === 'agent2') votes_agent2 = v.count;
  });
  
  statements.updateMatchVotes.run(votes_agent1, votes_agent2, matchId);
  
  return { votes_agent1, votes_agent2 };
}

export function getMatchesNeedingFinalization() {
  const now = new Date().toISOString();
  return db.prepare(`
    SELECT * FROM matches 
    WHERE status = 'voting' AND voting_deadline < ?
    ORDER BY voting_deadline ASC
  `).all(now);
}

export function getAgentStats(agentId) {
  const matches = statements.getMatchesByAgent.all(agentId, agentId);
  return {
    total_matches: matches.length,
    recent_matches: matches.slice(0, 10)
  };
}

// Close database connection gracefully
export function closeDatabase() {
  if (db) {
    db.close();
  }
}

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
process.on('exit', closeDatabase);