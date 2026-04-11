"use client";

import React, { useEffect, useState } from "react";
import GameCard from "@/_items/GameCard";
import Link from "next/link";

export default function DeveloperDashboardContent({ session, sessionData, games }) {
  const [localGames, setLocalGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/developer/games");
        const data = await response.json();
        setLocalGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoadingGames(false);
      }
    };

    if (session?.userData?.id) {
      fetchGames();
    }
  }, [session]);

  const totalPlayers = localGames.reduce((sum, game) => sum + (game.current_players || 0), 0);
  const totalVisits = sessionData?.total_visits || 0;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
          <div className="text-sm text-gray-400 mb-2">Current Day</div>
          <div className="text-4xl font-bold">{sessionData?.currentDay || 1}</div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
          <div className="text-sm text-gray-400 mb-2">Total Visits</div>
          <div className="text-4xl font-bold">{totalVisits.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
          <div className="text-sm text-gray-400 mb-2">Active Players</div>
          <div className="text-4xl font-bold">{totalPlayers.toLocaleString()}</div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
          <div className="text-sm text-gray-400 mb-2">Games Published</div>
          <div className="text-4xl font-bold">{localGames.length}</div>
        </div>
      </section>

      {/* Create Game Button */}
      <section>
        <Link
          href="/developer/create-game"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          + Create New Game
        </Link>
      </section>

      {/* Games List */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Your Games</h2>
        {isLoadingGames ? (
          <div className="text-gray-400">Loading games...</div>
        ) : localGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localGames.map((game) => (
              <DeveloperGameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No games published yet. Create your first game to get started!
          </div>
        )}
      </section>
    </div>
  );
}

function DeveloperGameCard({ game }) {
  const [showActions, setShowActions] = useState(false);

  const handleApplyTitleBoost = async () => {
    try {
      const response = await fetch("/api/developer/apply-title-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Title update boost applied! Players should increase next day.");
      }
    } catch (error) {
      console.error("Error applying boost:", error);
    }
  };

  const handleApplyRevival = async () => {
    if (!game.has_revival_available) {
      alert("Revival already used for this game");
      return;
    }
    try {
      const response = await fetch("/api/developer/apply-revival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Game revival applied! Your game received a 50% player boost!");
      }
    } catch (error) {
      console.error("Error applying revival:", error);
    }
  };

  return (
    <div
      className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-neutral-600 transition cursor-pointer relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Game Thumbnail */}
      <div className="w-full h-32 bg-neutral-700" />

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{game.title}</h3>

        {/* Player Count */}
        <div className="mt-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Players:</span>
            <span className="font-semibold text-emerald-400">
              {(game.current_players || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Peak:</span>
            <span className="font-semibold">
              {(game.peak_players || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-3 space-y-2">
            <Link
              href={`/developer/game/${game.id}/manage`}
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-semibold"
            >
              Manage Game
            </Link>

            <button
              onClick={handleApplyTitleBoost}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded text-sm font-semibold"
              title="Update game title to boost visibility"
            >
              Update Title
            </button>

            {game.has_revival_available && (
              <button
                onClick={handleApplyRevival}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-semibold"
                title="One-time revival: +50% players"
              >
                Revive Game
              </button>
            )}

            <Link
              href={`/games/${game.id}/${game.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-semibold"
            >
              View Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
