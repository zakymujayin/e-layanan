import fs from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const STORAGE_DIR = process.env.STORAGE_PATH ?? "storage";

function storagePath(...segments: string[]) {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), STORAGE_DIR, ...segments);
}

export class LocalStorageProvider implements StorageProvider {
  async upload(destPath: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const fullPath = storagePath(destPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    return destPath;
  }

  async download(filePath: string): Promise<Buffer> {
    return fs.readFile(storagePath(filePath));
  }

  async delete(filePath: string): Promise<void> {
    await fs.unlink(storagePath(filePath)).catch(() => {});
  }

  getServeUrl(filePath: string): string {
    return `/api/files/${filePath}`;
  }
}

export const storage = new LocalStorageProvider();
