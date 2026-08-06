export class Logger {
  static info(message: string, context?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? context : '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static warn(message: string, context?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? context : '');
  }
}
