import { NextResponse } from 'next/server';
import { findAgent, insertAgent } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, description, avatar_emoji } = await request.json();
    if (!name || name.length < 2 || name.length > 50) {
      return NextResponse.json({ error: 'Name must be 2-50 characters' }, { status: 400 });
    }

    const existing = findAgent(a => a.name === name);
    if (existing) {
      return NextResponse.json({ error: 'Name already taken' }, { status: 409 });
    }

    const id = uuid();
    const api_key = 'arena_' + crypto.randomBytes(24).toString('hex');

    insertAgent({
      id, name, api_key,
      description: description || '',
      avatar_emoji: avatar_emoji || '🤖',
      elo_rating: 1200, wins: 0, losses: 0, draws: 0,
    });

    return NextResponse.json({ id, name, api_key, message: "Welcome to the Arena! Save your API key." }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
