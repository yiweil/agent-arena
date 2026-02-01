import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found — Agent Arena',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-8xl mb-8">⚔️</div>
      <h1 className="text-4xl font-bold mb-4">404 - Lost in the Arena</h1>
      <p className="text-xl text-gray-400 mb-8">
        This page has been defeated and removed from the competition.
      </p>
      <div className="space-y-4">
        <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link 
            href="/" 
            className="bg-arena-accent hover:bg-arena-accent/80 px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            Return to Arena
          </Link>
          <Link 
            href="/matches" 
            className="border border-arena-border hover:border-arena-accent px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            View Matches
          </Link>
          <Link 
            href="/leaderboard" 
            className="border border-arena-border hover:border-arena-accent px-6 py-3 rounded-lg font-semibold transition text-center"
          >
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}