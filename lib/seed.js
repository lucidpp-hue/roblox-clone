import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function seedDatabase() {
  try {
    // Check if Ollie already exists
    const existingOllie = await prisma.user.findUnique({
      where: { username: 'Ollie' },
    });

    if (existingOllie) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const hashedPassword = await hashPassword('password123');
    const ollie = await prisma.user.create({
      data: {
        username: 'Ollie',
        email: 'ollie@demo.com',
        password: hashedPassword,
        followers: 2500,
        isVerified: true,
        profileBio: 'Roblox Developer & Creator',
        logoUrl: '/demo/ollie-logo.png',
        bannerUrl: '/demo/ollie-banner.png',
      },
    });

    // Create some demo games for Ollie
    const games = [];
    for (let i = 0; i < 3; i++) {
      const game = await prisma.game.create({
        data: {
          userId: ollie.id,
          title: `Demo Game ${i + 1}`,
          description: 'A demo game created by Ollie',
          activeUsers: Math.floor(Math.random() * 5000) + 100,
          totalVisits: Math.floor(Math.random() * 50000) + 1000,
        },
      });
      games.push(game);
    }

    console.log('Database seeded with demo user and games');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Seed on startup
seedDatabase();
