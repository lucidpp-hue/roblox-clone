#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database setup...');

  try {
    // Create demo user - Ollie
    const ollie = await prisma.user.upsert({
      where: { email: 'ollie@demo.com' },
      update: {},
      create: {
        username: 'ollie',
        email: 'ollie@demo.com',
        passwordHash: await bcrypt.hash('password123', 10),
        followers: 1500,
        totalRobux: 50000,
        isVerified: true,
      },
    });

    console.log('✅ Created demo user:', ollie.username);

    // Create some demo games for Ollie
    const game1 = await prisma.game.upsert({
      where: { id: 'demo-game-1' },
      update: {},
      create: {
        id: 'demo-game-1',
        title: 'Fish It!',
        description: 'Catch fish in this relaxing fishing simulator',
        creatorId: ollie.id,
        activeUsers: 2543,
        totalVisits: 125634,
        likes: 8945,
        dislikes: 234,
        favorites: 1200,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.gameAnalytics.create({
      data: {
        gameId: game1.id,
        day: 1,
        activeUsers: 2543,
        totalVisits: 125634,
        date: new Date(),
      },
    });

    const game2 = await prisma.game.upsert({
      where: { id: 'demo-game-2' },
      update: {},
      create: {
        id: 'demo-game-2',
        title: 'Tycoon Empire',
        description: 'Build your business empire from scratch',
        creatorId: ollie.id,
        activeUsers: 1823,
        totalVisits: 89234,
        likes: 6543,
        dislikes: 123,
        favorites: 892,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.gameAnalytics.create({
      data: {
        gameId: game2.id,
        day: 1,
        activeUsers: 1823,
        totalVisits: 89234,
        date: new Date(),
      },
    });

    console.log('✅ Created demo games:', game1.title, game2.title);

    // Create a demo group
    const group = await prisma.group.upsert({
      where: { id: 'demo-group-1' },
      update: {},
      create: {
        id: 'demo-group-1',
        name: 'Fishing Games Collective',
        description: 'A group dedicated to fishing and relaxation games',
        creatorId: ollie.id,
        memberCount: 342,
        logo: 'https://via.placeholder.com/100',
      },
    });

    // Add games to group
    await prisma.groupGame.upsert({
      where: {
        groupId_gameId: {
          groupId: group.id,
          gameId: game1.id,
        },
      },
      update: {},
      create: {
        groupId: group.id,
        gameId: game1.id,
      },
    });

    console.log('✅ Created demo group:', group.name);

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
