/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import config from '../config.js';

export function createWindowsFFmpegStream(device = 'Microphone') {
  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',

    '-loglevel',
    'warning',

    '-f',
    'dshow',

    '-i',
    `audio=${device}`,

    '-ac',
    `${config.audioChannels}`,

    '-ar',
    `${config.audioSamples}`,

    '-c:a',
    'libmp3lame',

    '-b:a',
    `${Math.round(config.bitrate / 1000)}k`,

    '-f',
    'mp3',

    '-',
  ]);

  ffmpeg.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  ffmpeg.on('exit', (code) => {
    console.log(`FFmpeg finalizó (${code})`);
  });

  return ffmpeg.stdout;
}
