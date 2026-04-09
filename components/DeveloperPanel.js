'use client';

import { useState } from 'react';
import GameCard from './GameCard';

export default function DeveloperPanel({ games, user, currentDay }) {
  const [selectedGame, setSelectedGame] = useState(null);

  const totalVisits = games.reduce((sum, g) => sum + g.totalVisits, 0);
  const totalActiveUsers = games.reduce((sum, g) => sum + g.activeUsers, 0);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Total Games</div>
          <div className="text-3xl font-bold text-white">{games.length}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Total Visits</div>
          <div className="text-3xl font-bold text-white">{totalVisits.toLocaleString()}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Active Players</div>
          <div className="text-3xl font-bold text-white">{totalActiveUsers.toLocaleString()}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-slate-400 text-sm mb-2">Followers</div>
          <div className="text-3xl font-bold text-white">{user?.followers || 0}</div>
          {(user?.followers || 0) >= 1000 && (
            <div className="text-xs text-blue-400 mt-2">✓ Verified</div>
          )}
        </div>
      </div>

      {/* Games List */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Your Creations</h2>
        {games.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">You haven&apos;t created any games yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Game Detail */}
      {selectedGame && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedGame.title}</h3>
              <p className="text-slate-400 mt-2">{selectedGame.description}</p>
            </div>
            <button
              onClick={() => setSelectedGame(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <div className="text-slate-400 text-sm">Active Players</div>
              <div className="text-2xl font-bold text-white">{selectedGame.activeUsers}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Total Visits</div>
              <div className="text-2xl font-bold text-white">{selectedGame.totalVisits}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
