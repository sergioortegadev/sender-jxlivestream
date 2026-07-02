import { config as loadEnv } from 'dotenv';

loadEnv();

export default {
  mode: Number(process.env.MODE ?? 0),

  serverUrl: process.env.SERVER_URL ?? 'http://localhost:8000/publish',

  audioFile: process.env.MP3_FILE ?? './media/audio.mp3',

  bitrate: Number(process.env.BITRATE ?? 128000),

  chunkSize: Number(process.env.CHUNK_SIZE ?? 4096),

  linuxDevice: process.env.LINUX_DEVICE ?? 'default',

  windowsDevice: process.env.WINDOWS_DEVICE ?? 'Microphone',

  publishToken: process.env.PUBLISH_TOKEN ?? '',
};
