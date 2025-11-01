import { defineConfig } from '@prisma/config';
import { execSync } from 'child_process';

export default defineConfig({
  // @ts-ignore: 'seed' is not defined on PrismaConfig but used for running a seed script
  seed: () => {
    console.log('🌱 Running HPMS seed...');
    execSync('node --loader ts-node/esm prisma/seed.ts', { stdio: 'inherit' });
  },
});
