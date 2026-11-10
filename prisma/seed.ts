import { runCompleteDemoSeed } from './seeds/index';

runCompleteDemoSeed()
  .then(() => {
    console.log('✓ Master seed completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Master seed failed:', err);
    process.exit(1);
  });
