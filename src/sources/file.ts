import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FileSourceOptions {
  file?: string;
  chunkSize?: number;
  bitrate?: number;
}

export async function* fileSource({
  file = path.join(__dirname, '../../media/audio.mp3'),
  chunkSize = 4096,
  bitrate = 128000,
}: FileSourceOptions = {}): AsyncGenerator<Buffer> {
  const bytesPerSecond = bitrate / 8;

  const interval = Math.round((chunkSize / bytesPerSecond) * 1000);

  while (true) {
    const fd = fs.openSync(file, 'r');

    const buffer = Buffer.alloc(chunkSize);

    try {
      while (true) {
        const bytesRead = fs.readSync(fd, buffer, 0, chunkSize, null);

        if (bytesRead === 0) {
          break;
        }

        yield buffer.subarray(0, bytesRead);

        await sleep(interval);
      }
    } finally {
      fs.closeSync(fd);
    }
  }
}
