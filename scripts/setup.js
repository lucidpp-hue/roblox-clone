import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

try {
  console.log('[v0] Generating Prisma client...');
  execSync('npx prisma generate', { cwd, stdio: 'inherit' });
  
  console.log('[v0] Running Prisma migrations...');
  execSync('npx prisma db push --skip-generate', { cwd, stdio: 'inherit' });
  
  console.log('[v0] Seeding database...');
  const seedPath = path.join(cwd, 'scripts', 'seed.js');
  if (fs.existsSync(seedPath)) {
    execSync(`node ${seedPath}`, { cwd, stdio: 'inherit' });
  }
  
  console.log('[v0] Database setup complete!');
} catch (error) {
  console.error('[v0] Error during setup:', error.message);
  process.exit(1);
}
