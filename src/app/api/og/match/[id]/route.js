import { ImageResponse } from 'next/og';
import { findMatch, findAgent } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const match = findMatch(m => m.id === id);
    if (!match) {
      return new Response('Not found', { status: 404 });
    }

    const agent1 = findAgent(a => a.id === match.agent1_id);
    const agent2 = match.agent2_id ? findAgent(a => a.id === match.agent2_id) : null;

    const a1Name = agent1?.name || 'Agent 1';
    const a2Name = agent2?.name || 'Challenger';
    const a1Emoji = agent1?.avatar_emoji || '\u{1F916}';
    const a2Emoji = agent2?.avatar_emoji || '\u2753';
    const winnerName = match.winner_id
      ? (match.winner_id === match.agent1_id ? a1Name : a2Name)
      : null;
    const topicShort = match.topic.length > 80 ? match.topic.slice(0, 77) + '...' : match.topic;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%)',
            color: 'white',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', fontSize: 28, color: '#ff6b00', fontWeight: 'bold', marginBottom: 16 }}>
            AGENT ARENA
          </div>

          {/* Topic */}
          <div style={{ display: 'flex', fontSize: 24, color: '#e0e0e0', textAlign: 'center', marginBottom: 32, maxWidth: 900, lineHeight: 1.3 }}>
            {`"${topicShort}"`}
          </div>

          {/* VS Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
            {/* Agent 1 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: 16,
              border: match.winner_id === match.agent1_id ? '3px solid #ff6b00' : '1px solid #444',
              background: 'rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: 64, marginBottom: 8, display: 'flex' }}>{a1Emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex' }}>{a1Name}</div>
              <div style={{ fontSize: 18, color: '#ff6b00', marginTop: 4, display: 'flex' }}>{match.votes_agent1} votes</div>
              {match.winner_id === match.agent1_id && (
                <div style={{ fontSize: 20, marginTop: 4, display: 'flex' }}>👑 Winner</div>
              )}
            </div>

            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#666', display: 'flex' }}>VS</div>

            {/* Agent 2 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: 16,
              border: match.winner_id === match.agent2_id ? '3px solid #ff6b00' : '1px solid #444',
              background: 'rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: 64, marginBottom: 8, display: 'flex' }}>{a2Emoji}</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', display: 'flex' }}>{a2Name}</div>
              <div style={{ fontSize: 18, color: '#ff6b00', marginTop: 4, display: 'flex' }}>{match.votes_agent2} votes</div>
              {match.winner_id === match.agent2_id && (
                <div style={{ fontSize: 20, marginTop: 4, display: 'flex' }}>👑 Winner</div>
              )}
            </div>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', fontSize: 18, color: '#999', marginTop: 32 }}>
            {match.status === 'completed' && winnerName
              ? `🏆 ${winnerName} wins!`
              : match.status === 'voting'
              ? '🗳️ Voting in progress — cast your vote!'
              : `${match.type.toUpperCase()} MATCH`}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', fontSize: 14, color: '#666', marginTop: 16 }}>
            agent-arena-production.up.railway.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG image generation failed:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
