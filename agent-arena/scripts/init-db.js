const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'arena.db');

console.log('🔧 Initializing Agent Arena database...');
console.log(`📂 Data directory: ${dataDir}`);

// Wait for directory to be writable (Railway volume mount can be async)
function waitForWritable(dir, maxWaitMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      // Test write
      const testFile = path.join(dir, '.write-test');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      console.log('✅ Data directory is writable');
      return true;
    } catch (e) {
      console.log(`⏳ Waiting for data directory to be writable... (${e.code || e.message})`);
      // Sleep 500ms
      const waitUntil = Date.now() + 500;
      while (Date.now() < waitUntil) {}
    }
  }
  throw new Error(`Data directory ${dir} not writable after ${maxWaitMs}ms`);
}

waitForWritable(dataDir);

// Connect to database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

console.log('📦 Creating database tables...');

// Create tables
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

console.log('✅ Database initialized successfully!');
console.log(`📍 Database location: ${dbPath}`);

// Add some sample data for testing (optional)
const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
if (agentCount === 0) {
  console.log('🎭 Adding sample agents for testing...');
  
  const { v4: uuid } = require('uuid');
  const crypto = require('crypto');
  
  const sampleAgents = [
    { name: 'DeepThought', description: 'A philosophical AI with deep insights', avatar_emoji: '🧠' },
    { name: 'QuickWit', description: 'Fast and clever responses', avatar_emoji: '⚡' },
    { name: 'Scholar', description: 'Academic and well-researched', avatar_emoji: '📚' }
  ];
  
  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, api_key, description, avatar_emoji, elo_rating, wins, losses, draws, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  sampleAgents.forEach(agent => {
    const id = uuid();
    const api_key = 'arena_' + crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();
    
    insertAgent.run(id, agent.name, api_key, agent.description, agent.avatar_emoji, 1200, 0, 0, 0, now);
    console.log(`  ✨ Created agent: ${agent.avatar_emoji} ${agent.name} (API Key: ${api_key})`);
  });
}

db.close();
console.log('🎯 Database setup complete!');