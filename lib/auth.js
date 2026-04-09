import { hash, compare } from 'bcryptjs';

export async function hashPassword(password) {
  return hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

export function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const ADMIN_USER = {
  id: 'ollie-admin',
  username: 'Ollie',
  email: 'ollie@demo.com',
  followers: 2500,
  isVerified: true,
  profileBio: 'Roblox Developer & Creator',
  logoUrl: '/demo/ollie-logo.png',
  bannerUrl: '/demo/ollie-banner.png'
};
