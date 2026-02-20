import http from 'http';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

const server = http.createServer(app);

// ─── Start ───────────────────────────────────────────────────────────────────
server.listen(config.port, () => {
    logger.info(`
  ╔══════════════════════════════════════════════════╗
  ║   CI/CD Auto-Healing Agent Backend               ║
  ║   Running on port ${config.port}                           ║
  ║   Environment: ${config.nodeEnv.padEnd(20)}              ║
  ╚══════════════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown — timeout exceeded.');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

export default server;
