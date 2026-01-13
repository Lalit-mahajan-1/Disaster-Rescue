const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  writeToFile(level, message) {
    const formattedMessage = this.formatMessage(level, message);
    const logFile = path.join(this.logsDir, `${level}.log`);
    
    fs.appendFile(logFile, formattedMessage + '\n', (err) => {
      if (err) console.error('Error writing to log file:', err);
    });
  }

  info(message) {
    console.log(`ℹ️  ${message}`);
    this.writeToFile('info', message);
  }

  error(message) {
    console.error(`❌ ${message}`);
    this.writeToFile('error', message);
  }

  warn(message) {
    console.warn(`⚠️  ${message}`);
    this.writeToFile('warn', message);
  }

  debug(message) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 ${message}`);
      this.writeToFile('debug', message);
    }
  }
}

module.exports = new Logger();