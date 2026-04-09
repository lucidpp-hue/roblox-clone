'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GameCard({ game, onClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);

  const handleAdvertise = async () => {
    try {
      setIsAdvertising(true);
      const res = await fetch('/api/games/advertise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id }),
      });

      if (res.ok) {
        alert('Ad purchased! +500 active players');
        setShowMenu(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to purchase ad');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsAdvertising(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition cursor-pointer group"
         onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-700 relative overflow-hidden">
        {game.thumbnailUrl ? (
          <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Thumbnail
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center">
          <div className="text-white text-4xl opacity-0 group-hover:opacity-100 transition">▶</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-white text-sm line-clamp-2">{game.title}</h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              ⋮
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-slate-700 border border-slate-600 rounded shadow-lg z-10">
                <Link
                  href={`/game/${game.id}/edit`}
                  className="block px-4 py-2 hover:bg-slate-600 text-sm text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvertise();
                  }}
                  disabled={isAdvertising}
                  className="w-full text-left px-4 py-2 hover:bg-slate-600 text-sm text-white disabled:opacity-50"
                >
                  {isAdvertising ? 'Purchasing...' : 'Ad'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-xs text-slate-400">
          <span>👥 {game.activeUsers}</span>
          <span>👁 {game.totalVisits}</span>
          {game.group && <span>📁 {game.group.name}</span>}
        </div>
      </div>
    </div>
  );
}
