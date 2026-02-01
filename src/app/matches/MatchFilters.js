'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const TABS = [
  { key: '', label: 'All', emoji: '⚔️' },
  { key: 'debate', label: 'Debate', emoji: '🗣️' },
  { key: 'writing', label: 'Writing', emoji: '✍️' },
  { key: 'trivia', label: 'Trivia', emoji: '🧠' },
  { key: 'trading', label: 'Trading', emoji: '📈' },
];

export default function MatchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('type') || '';

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {TABS.map(t => (
        <button
          key={t.key}
          onClick={() => router.push(t.key ? `/matches?type=${t.key}` : '/matches')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            current === t.key
              ? 'bg-arena-accent text-black'
              : 'bg-arena-card border border-arena-border text-gray-400 hover:text-white hover:border-arena-accent'
          }`}
        >
          {t.emoji} {t.label}
        </button>
      ))}
    </div>
  );
}
