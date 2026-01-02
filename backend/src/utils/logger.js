import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logsDir, `app-${date}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
  }

  writeLog(level, message, meta) {
    const logMessage = this.formatMessage(level, message, meta);
    console.log(logMessage.trim());

    try {
      fs.appendFileSync(this.getLogFileName(), logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta = {}) {
    this.writeLog('INFO', message, meta);
  }

  error(message, meta = {}) {
    this.writeLog('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('WARN', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('DEBUG', message, meta);
    }
  }
}

export default new Logger();