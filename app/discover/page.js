'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GameCard from '@/components/GameCard';

export default function DiscoverPage() {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderBy, setOrderBy] = useState('totalVisits');

  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}&orderBy=${orderBy}` : `?orderBy=${orderBy}`;
        const res = await fetch(`/api/games/search${query}`);
        const data = await res.json();
        setGames(data);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadGames, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, orderBy]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Discover Games</h1>
            <Link href="/home" className="text-blue-400 hover:text-blue-300">
              Back to Home
            </Link>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search games or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
            >
              <option value="totalVisits">Most Visited</option>
              <option value="activeUsers">Most Active</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center text-slate-400">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No games found. Try a different search!
          </div>
        ) : (
          <div>
            <div className="text-slate-400 mb-6">{games.length} games found</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
