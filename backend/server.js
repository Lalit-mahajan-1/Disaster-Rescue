const app = require('./src/app');
const connectDB = require('./src/config/database');
const { PORT } = require('./src/config/env');
const logger = require('./src/utils/logger');


connectDB();


const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});


process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});


process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});