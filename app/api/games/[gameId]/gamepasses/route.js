import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    const { gameId } = params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game || game.userId !== authToken) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { name, price } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Gamepass name is required' },
        { status: 400 }
      );
    }

    const gamepass = await prisma.gamePass.create({
      data: {
        gameId,
        name,
        price: price || 100,
      },
    });

    // Increment gamepass count
    await prisma.game.update({
      where: { id: gameId },
      data: { gamePassCount: { increment: 1 } },
    });

    return NextResponse.json(gamepass, { status: 201 });
  } catch (error) {
    console.error('Error creating gamepass:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
