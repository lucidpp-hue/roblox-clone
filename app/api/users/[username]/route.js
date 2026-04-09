import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    const { username } = params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        games: {
          include: {
            gamePasses: true,
            group: true,
          },
        },
        groups: {
          include: {
            members: true,
            games: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      followers: user.followers,
      isVerified: user.isVerified,
      profileBio: user.profileBio,
      logoUrl: user.logoUrl,
      bannerUrl: user.bannerUrl,
      games: user.games,
      groups: user.groups,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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
    const { username } = params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: authToken } });
    if (!user || user.username !== username) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const { profileBio, logoUrl, bannerUrl } = await request.json();

    const updated = await prisma.user.update({
      where: { id: authToken },
      data: {
        ...(profileBio !== undefined && { profileBio }),
        ...(logoUrl && { logoUrl }),
        ...(bannerUrl && { bannerUrl }),
      },
    });

    return NextResponse.json({
      username: updated.username,
      followers: updated.followers,
      isVerified: updated.isVerified,
      profileBio: updated.profileBio,
      logoUrl: updated.logoUrl,
      bannerUrl: updated.bannerUrl,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
