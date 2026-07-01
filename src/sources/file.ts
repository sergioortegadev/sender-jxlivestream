import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface FileSourceOptions {
  file?: string;
  chunkSize?: number;
}

export async function* fileSource({
  file = path.join(__dirname, '../../media/test.mp3'),
  chunkSize = 4096,
}: FileSourceOptions = {}): AsyncGenerator<Buffer> {
  while (true) {
    const fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(chunkSize);

    try {
      while (true) {
        const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, null);

        if (bytesRead === 0) break;

        yield buffer.subarray(0, bytesRead);
      }
    } finally {
      fs.closeSync(fd);
    }
  }
}