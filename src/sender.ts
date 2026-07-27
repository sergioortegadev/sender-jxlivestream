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
      console.log(`${simpleLog()} 📁 Modo desarrollo (archivo MP3)\n  ⚠️ Tener en cuenta que coincidan: \n   bit rate del archivo y BITRATE en .env\n   En Modo desarrollo no se tienen en cuenta audio channels ni samples`);

      return Readable.from(
        fileSource({
          file: config.audioFile,
          chunkSize: config.chunkSize,
          bitrate: config.bitrate,
        })
      );
    }

    case 1: {
      console.log(`${simpleLog()} 🐧 Modo OBS Linux (en vivo)\n`);

      return createLinuxFFmpegStream(config.linuxDevice);
    }

    case 2: {
      console.log(`${simpleLog()} 🪟 Modo OBS Windows (en vivo)\n`);

      return createWindowsFFmpegStream(config.windowsDevice);
    }

    default:
      throw new Error(`MODE inválido: ${config.mode}`);
  }
};

const main = async () => {
  console.log('\n----------------------------------------------------------');
  console.log('              ⬆️  Jxlivestream Sender ⬆️');
  console.log('----------------------------------------------------------');
  console.log(`  Servidor: ${config.serverUrl}`);
  console.log(`  Modo: ${config.mode}`);
  if (config.stationTitle)   console.log(`  Título: ${config.stationTitle} | (14 char)`);
  if (config.stationSubTitle) console.log(`  Subtítulo: ${config.stationSubTitle} | (35 char)`);
  if (config.stationDescription) console.log(`  Descripción: ${config.stationDescription}`);
  console.log('----------------------------------------------------------');
  if (config.bitrate) console.log(`  Bit Rate: ${config.bitrate} Kbps`);
  if (config.chunkSize) console.log(`  Chunk Size: ${config.chunkSize} Kbps`);
  if (config.audioChannels) console.log(`  Audio ${config.audioChannels === '2' ? 'Stereo' : 'Mono'}`);
  if (config.audioSamples) console.log(`  Audio Samples: ${config.audioSamples} Hz`);
  console.log(' · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·\n');

  while (true) {
    try {
      const source = await createSource();

      await publish(source, config.serverUrl);

      console.log('Reconectando en 1 segundos...\n');

      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(err);

      await new Promise((r) => setTimeout(r, 1000));
    }
  }
};

main();
