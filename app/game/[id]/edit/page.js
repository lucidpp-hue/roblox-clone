'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGame = async () => {
      try {
        const res = await fetch(`/api/games/${params.id}`);
        if (!res.ok) {
          router.push('/home');
          return;
        }
        const gameData = await res.json();
        setGame(gameData);
        setFormData({
          title: gameData.title,
          description: gameData.description,
        });
      } catch (error) {
        console.error('Error loading game:', error);
        router.push('/home');
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [params.id, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const res = await fetch(`/api/games/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update game');
      }

      const updated = await res.json();
      setGame(updated);
      alert('Game updated! Title changes give +5% player boost.');
      router.push('/home');
    } catch (err) {
      setError(err.message || 'Error saving game');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Game not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/home" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Edit Game</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Game Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter game title"
              />
              <p className="text-xs text-slate-400 mt-1">💡 Changing the title gives +5% active players</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-32 resize-none"
                placeholder="Enter game description"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700 rounded">
              <div>
                <div className="text-slate-400 text-sm">Active Players</div>
                <div className="text-2xl font-bold text-white">{game.activeUsers}</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Total Visits</div>
                <div className="text-2xl font-bold text-white">{game.totalVisits}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-2 px-4 rounded transition"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
