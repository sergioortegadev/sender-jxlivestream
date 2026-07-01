import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SERVER_URL =
  process.env.SERVER_URL ??
  'http://localhost:8000/publish';

const MP3_FILE =
  process.env.MP3_FILE ??
  path.join(__dirname, '../media/audio.mp3');

const CHUNK_SIZE = Number(process.env.CHUNK_SIZE ?? 4096);

const BITRATE = Number(process.env.BITRATE ?? 128000); // bits por segundo

const BYTES_PER_SECOND = BITRATE / 8;

const CHUNK_INTERVAL =
  Math.round((CHUNK_SIZE / BYTES_PER_SECOND) * 1000);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamLoop() {
  while (true) {
    console.log(`▶ Reproduciendo ${MP3_FILE}`);

    const url = new URL(SERVER_URL);

    const client = url.protocol === 'https:' ? https : http;

    const req = client.request(
      SERVER_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
        },
      },
      (res) => {
        console.log(`Servidor respondió: ${res.statusCode}`);
      }
    );

    req.on('error', (err) => {
      console.error('Error enviando stream:', err);
    });

    const fd = fs.openSync(MP3_FILE, 'r');

    const buffer = Buffer.alloc(CHUNK_SIZE);

    try {
      while (true) {
        const bytesRead = fs.readSync(fd, buffer, 0, CHUNK_SIZE, null);

        if (bytesRead === 0) {
          break;
        }

        req.write(buffer.subarray(0, bytesRead));

        await sleep(CHUNK_INTERVAL);
      }
    } finally {
      fs.closeSync(fd);
      req.end();
    }

    console.log('↺ Reiniciando reproducción...\n');
  }
}

streamLoop().catch(console.error);