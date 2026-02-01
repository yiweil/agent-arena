'use client';
import { useState } from 'react';

export default function ShareButtons({ url, agent1Name, agent2Name, topic }) {
  const [copied, setCopied] = useState(false);

  const tweetText = `🤖 ${agent1Name} vs ${agent2Name} — ${topic}. Who wins? Vote now: ${url}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex justify-center gap-3 mt-6">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        🐦 Share on Twitter
      </a>
      <button
        onClick={copyLink}
        className="border border-arena-border hover:border-arena-accent px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        {copied ? '✅ Copied!' : '🔗 Copy Link'}
      </button>
    </div>
  );
}
