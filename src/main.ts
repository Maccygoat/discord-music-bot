import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function main() {
  if (process.argv.includes('--help')) {
    console.log(`Usage: node ${process.argv[1]} [options]
  Options:
  --help                   Show this help message
  --log-level <log-level>  Specify the minimum log level to display
  --prod                   Run in production mode
  `);
    process.exit(0);
  }

  const prod =
    process.argv.includes('--prod') || process.env.NODE_ENV === 'production';

  // Define log levels in order of severity
  const logLevels: LogLevel[] = [
    'verbose',
    'debug',
    'log',
    'warn',
    'error',
    'fatal',
  ];

  if (prod) {
    console.log('Running in production mode');
  }

  // Get log level from command parameters or environment variable
  let minLogLevel = process.argv.includes('--log-level')
    ? process.argv[process.argv.indexOf('--log-level') + 1]
    : prod
      ? 'log'
      : 'verbose';

  // Validate and normalize the log level
  if (!logLevels.includes(minLogLevel as LogLevel)) {
    console.warn(`Invalid log level "${minLogLevel}", defaulting to "verbose"`);
    minLogLevel = 'verbose';
  }

  // Compute an array of log levels to be passed to the logger
  const logLevelArray = logLevels.slice(
    logLevels.indexOf(minLogLevel as LogLevel),
  );

  // Disable colour logging in production
  if (prod) {
    process.env.NO_COLOR = 'true';
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: logLevelArray,
  });

  app.enableShutdownHooks();

  process.on('SIGINT', () => {
    app.close();
  });

  process.on('SIGTERM', () => {
    app.close();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
