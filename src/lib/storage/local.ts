import fs from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const STORAGE_BASE = process.env.STORAGE_PATH || "storage";

export class LocalStorageProvider implements StorageProvider {
  async upload(destPath: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fullPath = path.join(STORAGE_BASE, destPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return destPath;
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(STORAGE_BASE, filePath);
    return fs.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(STORAGE_BASE, filePath);
    await fs.unlink(fullPath).catch(() => {});
  }

  getServeUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}

export const storage = new LocalStorageProvider();
