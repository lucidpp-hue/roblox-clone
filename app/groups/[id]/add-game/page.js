"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddGameToGroupPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [groupId, setGroupId] = useState(null);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setGroupId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!session || !groupId) return;

    const fetchGames = async () => {
      try {
        const response = await fetch("/api/developer/games");
        const data = await response.json();
        setGames(data.games || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        setError("Failed to load your games");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [session, groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGameId) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/groups/${groupId}/add-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: parseInt(selectedGameId) }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/groups/${groupId}`);
      } else {
        setError(data.error || "Failed to add game to group");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Sign In Required</h1>
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-lg p-8 max-w-md w-full border border-neutral-700">
        <h1 className="text-3xl font-bold mb-6">Add Game to Group</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-400 text-center py-8">Loading your games...</div>
        ) : games.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Select Game</label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Choose a game...</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedGameId}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {isSubmitting ? "Adding..." : "Add Game"}
            </button>
          </form>
        ) : (
          <div className="text-gray-400 text-center py-8">
            <p className="mb-4">You haven&apos;t created any games yet.</p>
            <Link
              href="/developer/create-game"
              className="text-blue-400 hover:text-blue-300"
            >
              Create a Game
            </Link>
          </div>
        )}

        <Link href={`/groups/${groupId}`} className="text-blue-400 hover:text-blue-300 text-sm mt-4 inline-block">
          Back to Group
        </Link>
      </div>
    </div>
  );
}
