import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, followers: true, isVerified: true, logoUrl: true },
        },
        gamePasses: true,
        group: true,
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    const { id } = params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game || game.userId !== authToken) {
      return NextResponse.json(
        { error: 'Not authorized to update this game' },
        { status: 403 }
      );
    }

    const { title, description, thumbnailUrl, groupId } = await request.json();

    // If title is being updated, give a small boost
    const isTitleUpdate = title && title !== game.title;

    const updatedGame = await prisma.game.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(groupId !== undefined && { groupId: groupId || null }),
        ...(isTitleUpdate && { lastTitleUpdateAt: new Date() }),
        // Apply title boost: +5% to activeUsers
        ...(isTitleUpdate && { activeUsers: Math.floor(game.activeUsers * 1.05) }),
      },
      include: {
        gamePasses: true,
        group: true,
      },
    });

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;
    const { id } = params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const game = await prisma.game.findUnique({ where: { id } });

    if (!game || game.userId !== authToken) {
      return NextResponse.json(
        { error: 'Not authorized to delete this game' },
        { status: 403 }
      );
    }

    await prisma.game.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
