"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function GroupDetailPage({ params }) {
  const { data: session } = useSession();
  const [group, setGroup] = useState(null);
  const [games, setGames] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [groupId, setGroupId] = useState(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setGroupId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroupData = async () => {
      try {
        const [groupRes, gamesRes, membersRes] = await Promise.all([
          fetch(`/api/groups/${groupId}`),
          fetch(`/api/groups/${groupId}/games`),
          fetch(`/api/groups/${groupId}/members`),
        ]);

        const groupData = await groupRes.json();
        const gamesData = await gamesRes.json();
        const membersData = await membersRes.json();

        setGroup(groupData.group);
        setGames(gamesData.games || []);
        setMembers(membersData.members || []);

        // Check if current user is owner
        if (session?.userData?.id === groupData.group?.creator_id) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, session]);

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        // Refresh members list
        const membersRes = await fetch(`/api/groups/${groupId}/members`);
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Group Not Found</h1>
          <Link href="/groups" className="text-blue-400 hover:text-blue-300">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  const isMember = members.some((m) => m.user_id === session?.userData?.id);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-gray-400">{group.description}</p>
            </div>
            <div className="flex gap-2">
              {!isMember && session && (
                <button
                  onClick={handleJoinGroup}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Join Group
                </button>
              )}
              {isOwner && (
                <Link
                  href={`/groups/${groupId}/add-game`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Add Game to Group
                </Link>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {members.length} Members
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Games Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Group Games</h2>
          {games.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GroupGameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No games in this group yet
            </div>
          )}
        </section>

        {/* Members Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Members</h2>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{member.username}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No members yet
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function GroupGameCard({ game }) {
  return (
    <Link href={`/games/${game.id}/${game.title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700 transition cursor-pointer">
        <div className="w-full h-32 bg-neutral-700" />
        <div className="p-4">
          <h3 className="font-bold text-lg truncate">{game.title}</h3>
          <p className="text-sm text-gray-400 mt-2">
            {(game.current_players || 0).toLocaleString()} Players
          </p>
        </div>
      </div>
    </Link>
  );
}
