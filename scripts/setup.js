import { execSync } from 'child_process';

const cwd = process.cwd();

try {
  console.log('[v0] Generating Prisma client...');
  execSync('npx prisma generate', { cwd, stdio: 'inherit' });
  console.log('[v0] Prisma client generated successfully!');
  process.exit(0);
} catch (error) {
  console.error('[v0] Error during setup:', error.message);
  process.exit(1);
}
