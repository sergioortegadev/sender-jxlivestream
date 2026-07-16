/* eslint-disable no-console */
import http from 'node:http';
import https from 'node:https';
import { Readable } from 'node:stream';
import config from './config.js';
import { simpleLog } from './helpers/helpers.js';

export async function publish(source: Readable, serverUrl: string): Promise<void> {
  const url = new URL(serverUrl);

  const client = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
          Connection: 'keep-alive',
          Authorization: `Bearer ${config.publishToken}`,
          ...(config.stationTitle   && { 'x-station-title':   config.stationTitle }),
          ...(config.stationSubTitle && { 'x-station-subtitle': config.stationSubTitle }),
          ...(config.stationDescription && { 'x-station-description': config.stationDescription }),
        },
      },
      (res) => {
        console.log(` ⬆️ ${simpleLog()} ⬆️  Publisher conectado (${res.statusCode})`);

        res.on('data', () => {});

        res.on('end', () => {
          console.log(`${simpleLog()} 📴 Conexión cerrada por servidor`);
          resolve();
        });
      }
    );

    req.setNoDelay(true);

    req.on('error', (err) => {
      reject(err);
    });

    source.on('error', (err) => {
      req.destroy(err);
    });

    source.pipe(req);

    source.on('end', () => {
      console.log(`${simpleLog()} 🎵 Fuente finalizada`);
      req.end();
    });
  });
}
