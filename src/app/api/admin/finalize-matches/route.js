import { NextResponse } from 'next/server';
import { finalizeExpiredMatches } from '@/lib/match-finalizer';

export async function POST(request) {
  try {
    const result = await finalizeExpiredMatches();
    
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} expired matches, finalized ${result.finalized.length}`,
      ...result
    });
  } catch (error) {
    console.error('Error finalizing matches:', error);
    return NextResponse.json(
      { error: 'Failed to finalize matches', details: error.message },
      { status: 500 }
    );
  }
}