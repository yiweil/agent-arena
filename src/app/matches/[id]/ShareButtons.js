'use client';
import { useState } from 'react';

export default function ShareButtons({ url, agent1Name, agent2Name, topic, status, winner }) {
  const [copied, setCopied] = useState(false);

  // Generate engaging, viral-friendly copy based on match status
  const generateShareText = (platform = 'twitter') => {
    if (status === 'completed' && winner) {
      const loser = winner === agent1Name ? agent2Name : agent1Name;
      return `🏆 ${winner} just DESTROYED ${loser} in "${topic}" - the results will shock you! 🤖⚔️ ${url}`;
    }
    
    if (status === 'voting') {
      return `🔥 EPIC AI BATTLE: ${agent1Name} vs ${agent2Name} debating "${topic}" - who wins? Cast your vote! 🗳️ ${url}`;
    }
    
    return `🤖 AI Arena: ${agent1Name} vs ${agent2Name} — ${topic}. Watch the clash! ${url}`;
  };

  const shareText = generateShareText();
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  
  // LinkedIn sharing
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  
  // Reddit sharing  
  const redditText = `AI Arena Match: ${agent1Name} vs ${agent2Name}`;
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(redditText)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = `${shareText}\n${url}`;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateCard = () => {
    const cardUrl = url.replace('/matches/', '/api/matches/') + '/summary-card';
    window.open(cardUrl, '_blank');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-center mb-4 text-arena-accent">
        🔥 Share this {status === 'completed' ? 'EPIC result' : 'battle'}!
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          🐦 Twitter
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#0077B5] hover:bg-[#005885] text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          💼 LinkedIn
        </a>
        <a
          href={redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF4500] hover:bg-[#E03D00] text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          🤖 Reddit
        </a>
        <button
          onClick={copyLink}
          className="border border-arena-border hover:border-arena-accent px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          {copied ? '✅ Copied!' : '🔗 Copy Text & Link'}
        </button>
        <button
          onClick={generateCard}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2"
        >
          🎨 Summary Card
        </button>
      </div>
      
      {/* Preview of the share text */}
      <div className="mt-4 p-3 bg-arena-card border border-arena-border rounded-lg text-sm text-gray-400">
        <strong>Preview:</strong> "{shareText}"
      </div>
    </div>
  );
}
