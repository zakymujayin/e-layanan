export interface StorageProvider {
  upload(destPath: string, buffer: Buffer, mimeType: string): Promise<string>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<void>;
  getServeUrl(filePath: string): string;
}
