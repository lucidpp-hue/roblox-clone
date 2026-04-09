import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const orderBy = searchParams.get('orderBy') || 'totalVisits';

    const games = await prisma.game.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { user: { username: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        user: {
          select: { username: true, followers: true, isVerified: true },
        },
        group: true,
      },
      orderBy: orderBy === 'activeUsers' ? { activeUsers: 'desc' } : { totalVisits: 'desc' },
      take: 50,
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error searching games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
