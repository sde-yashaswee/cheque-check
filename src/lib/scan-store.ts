export class ScanStore {
  private static pendingFile: File | null = null;

  static setFile(file: File) {
    this.pendingFile = file;
  }

  static getFile() {
    const file = this.pendingFile;
    this.pendingFile = null; // Clear after retrieval
    return file;
  }
}
