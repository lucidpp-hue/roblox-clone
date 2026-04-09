import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[v0] Starting database seed...');

  try {
    // Create demo user - Ollie
    const ollie = await prisma.user.upsert({
      where: { email: 'ollie@demo.com' },
      update: {},
      create: {
        username: 'ollie',
        email: 'ollie@demo.com',
        password: await bcrypt.hash('password123', 10),
        followers: 1500,
        isVerified: true,
        profileBio: 'Demo developer with verified badge!',
      },
    });

    console.log('[v0] Created demo user: ollie');

    // Create game 1 - Fish It!
    const game1 = await prisma.game.create({
      data: {
        title: 'Fish It!',
        description: 'Catch fish in this relaxing fishing simulator',
        userId: ollie.id,
        activeUsers: 2543,
        totalVisits: 125634,
      },
    });

    // Create analytics for game 1
    await prisma.gameAnalytics.create({
      data: {
        gameId: game1.id,
        userId: ollie.id,
        date: new Date(),
        activeUsers: 2543,
        visits: 125634,
      },
    });

    console.log('[v0] Created game: Fish It!');

    // Create game 2 - Tycoon Empire
    const game2 = await prisma.game.create({
      data: {
        title: 'Tycoon Empire',
        description: 'Build your business empire from scratch',
        userId: ollie.id,
        activeUsers: 1823,
        totalVisits: 89234,
      },
    });

    // Create analytics for game 2
    await prisma.gameAnalytics.create({
      data: {
        gameId: game2.id,
        userId: ollie.id,
        date: new Date(),
        activeUsers: 1823,
        visits: 89234,
      },
    });

    console.log('[v0] Created game: Tycoon Empire');

    // Create a demo group
    const group = await prisma.group.create({
      data: {
        name: 'Fishing Games Collective',
        description: 'A group dedicated to fishing and relaxation games',
        userId: ollie.id,
        memberCount: 342,
      },
    });

    // Add games to group
    await prisma.game.update({
      where: { id: game1.id },
      data: { groupId: group.id },
    });

    console.log('[v0] Created group: Fishing Games Collective');

    console.log('[v0] Database seed complete!');
  } catch (error) {
    console.error('[v0] Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
