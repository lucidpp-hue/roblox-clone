"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ManageGamePage({ params }) {
  const { data: session } = useSession();
  const [gameId, setGameId] = useState(null);
  const [game, setGame] = useState(null);
  const [gamepasses, setGamepasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPass, setShowAddPass] = useState(false);
  const [passForm, setPassForm] = useState({
    name: "",
    description: "",
    price: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setGameId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!gameId || !session) return;

    const fetchData = async () => {
      try {
        const [gameRes, passesRes] = await Promise.all([
          fetch(`/api/developer/game/${gameId}`),
          fetch(`/api/gamepasses?gameId=${gameId}`),
        ]);

        const gameData = await gameRes.json();
        const passesData = await passesRes.json();

        setGame(gameData.game);
        setGamepasses(passesData.gamepasses || []);
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gameId, session]);

  const handleCreatePass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gamepasses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          ...passForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGamepasses([...gamepasses, data.gamepass]);
        setPassForm({ name: "", description: "", price: 100 });
        setShowAddPass(false);
      }
    } catch (error) {
      console.error("Error creating gamepass:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <Link href="/developer/dashboard" className="text-blue-400 hover:text-blue-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/developer/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-2">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{game.title}</h1>
          <div className="text-gray-400 mt-2">
            <span>{(game.current_players || 0).toLocaleString()} Players</span>
            <span className="mx-2">•</span>
            <span>Peak: {(game.peak_players || 0).toLocaleString()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Game Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="text-sm text-gray-400">Current Players</div>
            <div className="text-3xl font-bold mt-2">
              {(game.current_players || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="text-sm text-gray-400">Peak Players</div>
            <div className="text-3xl font-bold mt-2">
              {(game.peak_players || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="text-sm text-gray-400">Gamepasses</div>
            <div className="text-3xl font-bold mt-2">{gamepasses.length}</div>
          </div>
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="text-sm text-gray-400">Pass Revenue</div>
            <div className="text-3xl font-bold mt-2">
              {gamepasses.reduce((sum, p) => sum + (p.sales || 0) * p.price, 0).toLocaleString()}
            </div>
          </div>
        </section>

        {/* Gamepasses Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Gamepasses</h2>
            <button
              onClick={() => setShowAddPass(!showAddPass)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              + Create Gamepass
            </button>
          </div>

          {showAddPass && (
            <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 mb-6">
              <form onSubmit={handleCreatePass} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pass Name</label>
                  <input
                    type="text"
                    value={passForm.name}
                    onChange={(e) =>
                      setPassForm({ ...passForm, name: e.target.value })
                    }
                    maxLength={255}
                    placeholder="e.g., Premium Access"
                    className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={passForm.description}
                    onChange={(e) =>
                      setPassForm({ ...passForm, description: e.target.value })
                    }
                    maxLength={1000}
                    placeholder="Describe what players get with this pass"
                    rows={3}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (Robux)</label>
                  <input
                    type="number"
                    value={passForm.price}
                    onChange={(e) =>
                      setPassForm({ ...passForm, price: parseInt(e.target.value) })
                    }
                    min={50}
                    step={50}
                    className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg"
                  >
                    {isSubmitting ? "Creating..." : "Create Pass"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPass(false)}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {gamepasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gamepasses.map((pass) => (
                <GamepassCard key={pass.id} gamepass={pass} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8 bg-neutral-800 rounded-lg border border-neutral-700">
              No gamepasses yet. Create one to start earning!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function GamepassCard({ gamepass }) {
  return (
    <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg flex-1">{gamepass.name}</h3>
        <span className="bg-emerald-900 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold">
          {gamepass.price} R$
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{gamepass.description}</p>
      <div className="text-sm">
        <span className="text-gray-400">Sales: </span>
        <span className="font-semibold">{gamepass.sales || 0}</span>
      </div>
    </div>
  );
}
