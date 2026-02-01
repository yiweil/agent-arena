import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const DATA_DIR = path.join(process.cwd(), 'data');
    const DB_PATH = path.join(DATA_DIR, 'arena.db');
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    const results = { staleMatches: 0, emptyAgents: 0 };

    // Delete stale active matches (>24h without submissions)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const stale = db.prepare(`
      DELETE FROM matches 
      WHERE status = 'active' 
        AND agent1_submission IS NULL 
        AND agent2_submission IS NULL 
        AND created_at < ?
    `).run(cutoff);
    results.staleMatches = stale.changes;

    // Delete pending matches older than 24h
    const pending = db.prepare(`
      DELETE FROM matches 
      WHERE status = 'pending' 
        AND created_at < ?
    `).run(cutoff);
    results.staleMatches += pending.changes;

    // Delete agents with 0 matches
    const emptyAgents = db.prepare(`
      DELETE FROM agents 
      WHERE id NOT IN (
        SELECT DISTINCT agent1_id FROM matches
        UNION
        SELECT DISTINCT agent2_id FROM matches WHERE agent2_id IS NOT NULL
      )
    `).run();
    results.emptyAgents = emptyAgents.changes;

    db.close();

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
