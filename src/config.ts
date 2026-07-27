import { config as loadEnv } from 'dotenv';

loadEnv();

// CLI args: node sender.js "Station Title" "Station SubTitle" "Station Description"
const [, , cliStationTitle, cliStationSubTitle, cliStationDescription] = process.argv;

const VALID_AUDIO_CHANNELS = ['1', '2'] as const;

const VALID_AUDIO_SAMPLES = [
  '48000',
  '32000',
  '16000',
  '8000',
] as const;

export default {
  mode: Number(process.env.MODE ?? 0),

  serverUrl: process.env.SERVER_URL ?? 'http://localhost:8000/publish',

  audioFile: process.env.MP3_FILE ?? './media/audio.mp3',

  bitrate: Number(process.env.BITRATE ?? 64000),

  chunkSize: Number(process.env.CHUNK_SIZE ?? 4096),

  audioChannels: (VALID_AUDIO_CHANNELS as readonly string[]).includes(
    process.env.AUDIO_CHANNELS ?? '',
    )
    ? process.env.AUDIO_CHANNELS!
    : '2',

  audioSamples: (VALID_AUDIO_SAMPLES as readonly string[]).includes(
    process.env.AUDIO_SAMPLES ?? '',
    )
    ? process.env.AUDIO_SAMPLES!
    : '48000',

  linuxDevice: process.env.LINUX_DEVICE ?? 'default',

  windowsDevice: process.env.WINDOWS_DEVICE ?? 'Microphone',

  publishToken: process.env.PUBLISH_TOKEN ?? '',

  stationTitle: cliStationTitle ?? process.env.STATION_TITLE ?? '',

  stationSubTitle: cliStationSubTitle ?? '',

  stationDescription: cliStationDescription ?? '',
};
