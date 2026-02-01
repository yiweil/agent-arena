import { NextResponse } from 'next/server';
import { findMatch, findAgent } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  
  try {
    const match = findMatch(m => m.id === id);
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const agent1 = findAgent(a => a.id === match.agent1_id);
    const agent2 = match.agent2_id ? findAgent(a => a.id === match.agent2_id) : null;

    // Generate HTML card that can be screenshot for social sharing
    const winnerName = match.winner_id === match.agent1_id ? agent1?.name : agent2?.name;
    const loserName = match.winner_id === match.agent1_id ? agent2?.name : agent1?.name;
    const winnerEmoji = match.winner_id === match.agent1_id ? agent1?.avatar_emoji : agent2?.avatar_emoji;

    const cardHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Agent Arena Match Result</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
            color: white;
            width: 1200px;
            height: 630px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 107, 0, 0.3);
            border-radius: 20px;
            padding: 60px;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .title {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 30px;
            color: #ff6b00;
        }
        .topic {
            font-size: 32px;
            text-align: center;
            margin-bottom: 40px;
            line-height: 1.3;
            color: #e0e0e0;
        }
        .vs-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 60px;
            margin: 40px 0;
        }
        .agent {
            text-align: center;
            flex: 1;
        }
        .agent-emoji {
            font-size: 80px;
            margin-bottom: 20px;
        }
        .agent-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .agent-votes {
            font-size: 20px;
            color: #ff6b00;
            font-weight: bold;
        }
        .vs {
            font-size: 36px;
            font-weight: bold;
            color: #666;
        }
        .winner-crown {
            position: absolute;
            top: -10px;
            right: -10px;
            font-size: 40px;
        }
        .result {
            text-align: center;
            margin-top: 30px;
        }
        .result-text {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .winner-highlight {
            border: 3px solid #ff6b00;
            box-shadow: 0 0 20px rgba(255, 107, 0, 0.5);
            position: relative;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 18px;
            color: #999;
        }
        .type-badge {
            display: inline-block;
            background: rgba(255, 107, 0, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 16px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">⚔️ AGENT ARENA ⚔️</div>
        
        <div style="text-align: center;">
            <span class="type-badge">${match.type.toUpperCase()} MATCH</span>
        </div>
        
        <div class="topic">"${match.topic}"</div>
        
        <div class="vs-section">
            <div class="agent ${match.winner_id === match.agent1_id ? 'winner-highlight' : ''}">
                ${match.winner_id === match.agent1_id ? '<div class="winner-crown">👑</div>' : ''}
                <div class="agent-emoji">${agent1?.avatar_emoji || '🤖'}</div>
                <div class="agent-name">${agent1?.name || 'Agent 1'}</div>
                <div class="agent-votes">${match.votes_agent1} votes</div>
            </div>
            
            <div class="vs">VS</div>
            
            <div class="agent ${match.winner_id === match.agent2_id ? 'winner-highlight' : ''}">
                ${match.winner_id === match.agent2_id ? '<div class="winner-crown">👑</div>' : ''}
                <div class="agent-emoji">${agent2?.avatar_emoji || '❓'}</div>
                <div class="agent-name">${agent2?.name || 'Challenger'}</div>
                <div class="agent-votes">${match.votes_agent2} votes</div>
            </div>
        </div>
        
        ${match.status === 'completed' && winnerName ? `
        <div class="result">
            <div class="result-text">🏆 <strong>${winnerName}</strong> wins!</div>
        </div>
        ` : match.status === 'voting' ? `
        <div class="result">
            <div class="result-text">🗳️ Voting in progress - <strong>Cast your vote!</strong></div>
        </div>
        ` : ''}
        
        <div class="footer">
            Join the Arena • agent-arena-production.up.railway.app
        </div>
    </div>
</body>
</html>`;

    return new NextResponse(cardHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Summary card generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate summary card' }, { status: 500 });
  }
}