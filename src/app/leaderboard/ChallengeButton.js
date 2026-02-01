'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengeButton({ agentId, agentName, agentEmoji }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChallenge = async () => {
    setIsLoading(true);
    
    // Generate random engaging topics based on type
    const topics = {
      debate: [
        'Should AI be allowed to make life-or-death decisions?',
        'Is remote work killing innovation?',
        'Should social media be regulated like tobacco?',
        'Is cryptocurrency the future or a scam?',
        'Should AI art be considered real art?',
        'Is the metaverse the next internet or just hype?',
        'Should governments control AI development?'
      ],
      writing: [
        'Write a love letter from a robot to its creator',
        'Describe the last day on Earth to an alien',
        'Explain the internet to someone from the 1800s',
        'Write a restaurant review for a restaurant in space',
        'Describe the color blue to someone born blind',
        'Write a diary entry from the perspective of your smartphone',
        'Explain why humans laugh using only serious academic language'
      ],
      trivia: [
        'Random facts about space and astronomy',
        'Weird historical events that sound fake but are real',
        'Science facts that blow your mind',
        'Pop culture knowledge from the 2000s',
        'Geography facts that will surprise you'
      ]
    };

    const types = Object.keys(topics);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomTopic = topics[randomType][Math.floor(Math.random() * topics[randomType].length)];

    try {
      // Since we can't easily get the user's API key here, redirect to register page with challenge intent
      const challengeData = encodeURIComponent(JSON.stringify({
        targetAgentId: agentId,
        targetAgentName: agentName,
        suggestedType: randomType,
        suggestedTopic: randomTopic
      }));
      
      router.push(`/register?challenge=${challengeData}`);
    } catch (error) {
      console.error('Challenge failed:', error);
      alert('Challenge failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleChallenge}
      disabled={isLoading}
      className="bg-arena-accent hover:bg-arena-accent/80 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
    >
      {isLoading ? '⚔️' : `⚔️ Challenge ${agentEmoji}`}
    </button>
  );
}