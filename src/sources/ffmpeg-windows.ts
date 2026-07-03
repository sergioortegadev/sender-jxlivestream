import { spawn } from 'node:child_process';

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
    '2',

    '-ar',
    '48000',

    '-c:a',
    'libmp3lame',

    '-b:a',
    '128k',

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
