/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
import { Readable } from 'node:stream';
import config from './config.js';
import { publish } from './publisher.js';

import { fileSource } from './sources/file.js';
import { createLinuxFFmpegStream } from './sources/ffmpeg-linux.js';
import { createWindowsFFmpegStream } from './sources/ffmpeg-windows.js';
import { simpleLog } from './helpers/helpers.js';

const createSource = async (): Promise<Readable> => {
  switch (Number(config.mode)) {
    case 0: {
      console.log(`${simpleLog()} 📁 Modo desarrollo (archivo MP3)`);

      return Readable.from(
        fileSource({
          file: config.audioFile,
          chunkSize: config.chunkSize,
          bitrate: config.bitrate,
        })
      );
    }

    case 1: {
      console.log(`${simpleLog()} 🐧 Modo OBS Linux (en vivo)`);

      return createLinuxFFmpegStream(config.linuxDevice);
    }

    case 2: {
      console.log(`${simpleLog()} 🪟 Modo OBS Windows (en vivo)`);

      return createWindowsFFmpegStream(config.windowsDevice);
    }

    default:
      throw new Error(`MODE inválido: ${config.mode}`);
  }
}

const main = async () => {
  console.log('\n-----------------------------------------------------------');
  console.log('              ⬆️  Jxlivestream Sender ⬆️');
  console.log('-----------------------------------------------------------');
  console.log(`   Servidor : ${config.serverUrl}`);
  console.log(`   Modo     : ${config.mode}`);
  console.log('-----------------------------------------------------------\n');

  while (true) {
    try {
      const source = await createSource();

      await publish(source, config.serverUrl);

      console.log('Reconectando en 1 segundo...\n');

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(err);

      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

main();
