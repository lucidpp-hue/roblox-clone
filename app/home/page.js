'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeveloperPanel from '@/components/DeveloperPanel';
import CreateGameModal from '@/components/CreateGameModal';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user and games
        const gamesRes = await fetch('/api/games');
        if (gamesRes.status === 401) {
          router.push('/login');
          return;
        }
        const gamesData = await gamesRes.json();
        setGames(gamesData);

        // Get user info from localStorage or session
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.username) {
          const userRes = await fetch(`/api/users/${userInfo.username}`);
          const userData = await userRes.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleNextDay = async () => {
    try {
      const res = await fetch('/api/games/next-day', { method: 'POST' });
      const data = await res.json();
      setGames(data.games);
      setCurrentDay(prev => prev + 1);
    } catch (error) {
      console.error('Error advancing day:', error);
    }
  };

  const handleCreateGame = async (gameData) => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      const newGame = await res.json();
      setGames([newGame, ...games]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-white">Roblox Developer Simulator</h1>
            <div className="text-slate-300">Day {currentDay}</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleNextDay}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ▶ Next Day
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              + Create
            </button>
            <Link href="/discover" className="text-blue-400 hover:text-blue-300">
              Discover
            </Link>
            {user && (
              <Link href={`/profile/${user.username}`} className="text-blue-400 hover:text-blue-300">
                Profile
              </Link>
            )}
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                localStorage.removeItem('userInfo');
                router.push('/login');
              }}
              className="text-slate-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Developer Panel */}
        <DeveloperPanel games={games} user={user} currentDay={currentDay} />
      </main>

      {/* Create Game Modal */}
      {showCreateModal && (
        <CreateGameModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGame}
        />
      )}
    </div>
  );
}
