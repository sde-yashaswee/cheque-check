export class Logger {
  static info(message: string, context?: unknown) {
    console.log(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      context ? context : '',
    )
  }

  static error(message: string, error?: unknown) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error)
  }

  static warn(message: string, context?: unknown) {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      context ? context : '',
    )
  }
}
