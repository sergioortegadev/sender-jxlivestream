/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
import { Readable } from 'node:stream';
import config from './config.js';
import { publish } from './publisher.js';

import { fileSource } from './sources/file.js';
import { createLinuxFFmpegStream } from './sources/ffmpeg-linux.js';
import { createWindowsFFmpegStream } from './sources/ffmpeg-windows.js';

async function createSource(): Promise<Readable> {
  switch (Number(config.mode)) {
    case 0: {
      console.log('📁 Modo desarrollo (archivo MP3)');

      return Readable.from(
        fileSource({
          file: config.audioFile,
          chunkSize: config.chunkSize,
          bitrate: config.bitrate,
        })
      );
    }

    case 1: {
      console.log('🐧 Modo OBS Linux');

      return createLinuxFFmpegStream(config.linuxDevice);
    }

    case 2: {
      console.log('🪟 Modo OBS Windows');

      return createWindowsFFmpegStream(config.windowsDevice);
    }

    default:
      throw new Error(`MODE inválido: ${config.mode}`);
  }
}

async function main() {
  console.log('--------------------------------------');
  console.log('     ⬆️ Jxlivestream Sender ⬆️');
  console.log('--------------------------------------');
  console.log(`   Servidor : ${config.serverUrl}`);
  console.log(`   Modo     : ${config.mode}`);
  console.log('--------------------------------------');

  while (true) {
    try {
      const source = await createSource();

      await publish(source, config.serverUrl);

      console.log('Reconectando en 2 segundos...\n');

      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(err);

      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

main();
