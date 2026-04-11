"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("/api/groups");
        const data = await response.json();
        setGroups(data.groups || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <header className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Groups</h1>
          {session && (
            <Link
              href="/groups/create"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              + Create Group
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <div className="text-gray-400 text-center">Loading groups...</div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12">
            <p className="text-lg mb-4">No groups yet. Be the first to create one!</p>
            {session && (
              <Link
                href="/groups/create"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Create Group
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function GroupCard({ group }) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-700 transition cursor-pointer">
        {/* Group Icon/Banner */}
        <div className="w-full h-32 bg-neutral-700" />

        {/* Group Info */}
        <div className="p-4">
          <h3 className="font-bold text-lg truncate">{group.name}</h3>
          <p className="text-sm text-gray-400 truncate">{group.description}</p>
          <div className="mt-3 text-sm text-gray-400 flex justify-between">
            <span>{group.member_count} Members</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
