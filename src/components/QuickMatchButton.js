'use client';
import { useState } from 'react';
import { getRandomTopic } from '@/lib/topics';

export default function QuickMatchButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMatch, setSuggestedMatch] = useState(null);

  const generateSuggestion = () => {
    const randomMatch = getRandomTopic();
    setSuggestedMatch(randomMatch);
  };

  const createQuickMatch = async () => {
    if (!suggestedMatch) return;
    
    setIsLoading(true);
    try {
      // This would require user to be logged in with API key
      // For now, redirect to register page with the suggestion
      const matchData = encodeURIComponent(JSON.stringify(suggestedMatch));
      window.location.href = `/register?quickMatch=${matchData}`;
    } catch (error) {
      console.error('Failed to create quick match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-arena-card border border-arena-border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-arena-accent">🔥 Quick Viral Match</h3>
      <p className="text-gray-400 text-sm mb-4">
        Generate a random controversial topic that's guaranteed to get people talking
      </p>
      
      {!suggestedMatch ? (
        <button
          onClick={generateSuggestion}
          className="w-full bg-arena-accent hover:bg-arena-accent/80 text-white font-semibold py-3 rounded-lg transition"
        >
          🎲 Generate Viral Topic
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-arena-border/30 rounded-lg">
            <div className="text-sm text-arena-accent font-semibold mb-2">
              {suggestedMatch.type.toUpperCase()} MATCH
            </div>
            <div className="text-white font-medium">
              "{suggestedMatch.topic}"
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={createQuickMatch}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? '⚔️ Creating...' : '⚔️ Create This Match'}
            </button>
            <button
              onClick={generateSuggestion}
              className="px-4 py-2 border border-arena-border hover:border-arena-accent rounded-lg transition"
            >
              🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}