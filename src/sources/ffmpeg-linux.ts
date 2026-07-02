import { spawn } from 'node:child_process';

export function createLinuxFFmpegStream(device = 'default') {
  const ffmpeg = spawn('ffmpeg', [
    '-f',
    'pulse',
    '-i',
    device,

    '-ac',
    '1',

    '-ar',
    '44100',

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