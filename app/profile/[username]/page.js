'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import GameCard from '@/components/GameCard';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('creations');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/users/${params.username}`);
        if (!res.ok) {
          router.push('/home');
          return;
        }
        const userData = await res.json();
        setUser(userData);
        setGames(userData.games || []);
        setGroups(userData.groups || []);

        // Check if it's the user's own profile
        const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setIsOwnProfile(currentUser.username === params.username);
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/home');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [params.username, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/home" className="text-blue-400 hover:text-blue-300">
            ← Back
          </Link>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            {user.bannerUrl ? (
              <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8 items-start mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-800 overflow-hidden flex-shrink-0">
            {user.logoUrl ? (
              <img src={user.logoUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold text-white">{user.username}</h1>
              {user.isVerified && user.followers >= 1000 && (
                <span className="text-blue-400 text-2xl">✓</span>
              )}
            </div>
            <p className="text-slate-400 mb-4">{user.profileBio || 'No bio added'}</p>
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold text-white">{user.followers}</div>
                <div className="text-sm text-slate-400">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{games.length}</div>
                <div className="text-sm text-slate-400">Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{groups.length}</div>
                <div className="text-sm text-slate-400">Groups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-700 mb-8">
          <button
            onClick={() => setActiveTab('creations')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'creations'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Creations ({games.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'groups'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Groups ({groups.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'creations' && (
          <div>
            {games.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No games created yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            {groups.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No groups created yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/group/${group.id}`}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
                  >
                    <div className="flex gap-4">
                      {group.iconUrl ? (
                        <img
                          src={group.iconUrl}
                          alt={group.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded bg-slate-700 flex items-center justify-center">
                          📁
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg">{group.name}</h3>
                        <p className="text-sm text-slate-400">{group.members?.length || 0} members</p>
                        <p className="text-sm text-slate-400">{group.games?.length || 0} games</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
