"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DeveloperDashboardContent from "./dashboard-content";

export default function DeveloperDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (!session) return;

    // Fetch developer session data
    const fetchData = async () => {
      try {
        const response = await fetch("/api/developer/session");
        const data = await response.json();
        setSessionData(data);
      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };

    fetchData();
  }, [session]);

  const handleDayAdvance = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/day-advance", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setSessionData((prev) => ({
          ...prev,
          currentDay: data.currentDay,
        }));
        // Refresh games data
        const gamesResponse = await fetch("/api/developer/games");
        const gamesData = await gamesResponse.json();
        setGames(gamesData.games || []);
      }
    } catch (error) {
      console.error("Error advancing day:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Developer Dashboard</h1>
          <p className="text-gray-400 mb-6">Please sign in to access your dashboard</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Developer Dashboard</h1>
            {sessionData && (
              <div className="text-sm text-gray-400">
                Day {sessionData.currentDay}
              </div>
            )}
          </div>
          <button
            onClick={handleDayAdvance}
            disabled={isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            ▶ Next Day
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {sessionData ? (
          <DeveloperDashboardContent
            session={session}
            sessionData={sessionData}
            games={games}
          />
        ) : (
          <div className="text-center text-gray-400">Loading dashboard...</div>
        )}
      </main>
    </div>
  );
}
