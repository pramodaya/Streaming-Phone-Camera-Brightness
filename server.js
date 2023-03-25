const express = require('express');
const { Server } = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/chart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chart.html'));
});

const phoneIP = 'http://192.168.135.71:8080/video';

function sendVideoFrames() {
  const command = ffmpeg(phoneIP)
    .outputOptions('-vf', 'fps=30')
    .format('image2pipe')
    .pipe();

  command.on('data', (frame) => {
    const frameDataURL = `data:image/jpeg;base64,${frame.toString('base64')}`;
    io.emit('frame', frameDataURL);
  });

  command.on('error', (error) => {
    console.error('Error in ffmpeg:', error);
  });
}

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = process.env.PORT || 8081;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

sendVideoFrames(); // Start sending video frames
