import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    const { gameId } = await request.json();

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if game exists and belongs to user
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game || game.userId !== authToken) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Check if already has an active ad
    const existingAd = await prisma.advertisement.findUnique({
      where: { gameId },
    });

    if (existingAd) {
      return NextResponse.json(
        { error: 'Game already has an active advertisement' },
        { status: 400 }
      );
    }

    // Create ad and boost game
    const ad = await prisma.advertisement.create({
      data: {
        gameId,
        userId: authToken,
        boost: 500,
      },
    });

    // Add 500 active players
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        activeUsers: {
          increment: 500,
        },
      },
      include: {
        gamePasses: true,
      },
    });

    return NextResponse.json({
      ad,
      game: updatedGame,
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
