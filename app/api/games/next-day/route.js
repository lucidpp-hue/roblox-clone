import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: authToken } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all user's games
    const games = await prisma.game.findMany({
      where: { userId: authToken },
    });

    const updatedGames = [];

    for (const game of games) {
      // Create analytics snapshot for today
      await prisma.gameAnalytics.upsert({
        where: {
          gameId_userId_date: {
            gameId: game.id,
            userId: authToken,
            date: today,
          },
        },
        create: {
          gameId: game.id,
          userId: authToken,
          date: today,
          activeUsers: game.activeUsers,
          visits: game.totalVisits,
        },
        update: {
          activeUsers: game.activeUsers,
          visits: game.totalVisits,
        },
      });

      // Calculate decay for next day
      let newActiveUsers = game.activeUsers;

      // Base decay: -5% to -15% randomly
      const decayPercent = 5 + Math.random() * 10;
      newActiveUsers = Math.floor(newActiveUsers * (1 - decayPercent / 100));

      // Sometimes drop significantly: -30% to -50% with 20% chance
      if (Math.random() < 0.2) {
        const significantDrop = 30 + Math.random() * 20;
        newActiveUsers = Math.floor(newActiveUsers * (1 - significantDrop / 100));
      }

      // Add slight visits based on active users
      const newVisits = game.totalVisits + Math.floor(newActiveUsers * 0.5);

      const updated = await prisma.game.update({
        where: { id: game.id },
        data: {
          activeUsers: Math.max(0, newActiveUsers),
          totalVisits: newVisits,
        },
        include: {
          gamePasses: true,
          group: true,
        },
      });

      updatedGames.push(updated);
    }

    return NextResponse.json({
      success: true,
      games: updatedGames,
      date: today,
    });
  } catch (error) {
    console.error('Error advancing day:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
