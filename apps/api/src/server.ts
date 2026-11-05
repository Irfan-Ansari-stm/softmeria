import { app } from './app';
import { config } from './config';
import { prisma } from './config/db';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✓ Successfully connected to PostgreSQL database');

    const server = app.listen(config.port, () => {
      console.log(`🚀 DevBlueprint API listening on http://localhost:${config.port}`);
      console.log(`📡 Base REST endpoint: http://localhost:${config.port}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${config.port}/health`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('PostgreSQL connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

