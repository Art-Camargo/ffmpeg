import http from 'http';
import { spawn } from 'child_process';

const server = http.createServer((req, res) => {
  console.log('Nova conexão recebida!');

  res.writeHead(200, { 'Content-Type': 'video/mp4' });

  const ffmpegProcess = spawn('ffmpeg', [
    '-re',
    '-f', 'v4l2',
    '-i', '/dev/video0',
    '-vf', 'scale=640:360',
    '-r', '15',
    '-vcodec', 'libvpx',
    '-deadline', 'realtime',
    '-b:v', '500k',
    '-f', 'webm',
    'pipe:1'
  ], { stdio: ['pipe', 'pipe', 'pipe'] });


  ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg erro: ${data}`);
  });
  ffmpegProcess.stdout.on('data', () => {
    console.log('Enviando vídeo para o cliente...');
  });

  ffmpegProcess.on('close', (code, signal) => {
    console.log(`FFmpeg encerrado com código ${code} e sinal ${signal}`);
  });
  ffmpegProcess.stdout.pipe(res);
  req.on('close', () => {
    console.log('Conexão encerrada. Matando FFmpeg...');
    ffmpegProcess.kill();
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
