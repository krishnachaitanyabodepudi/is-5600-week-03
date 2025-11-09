// --- Import dependencies ---
const express = require('express');
const path = require('path');
const EventEmitter = require('events');

// --- Initialize app and variables ---
const port = process.env.PORT || 3000;
const app = express();
const chatEmitter = new EventEmitter();

// --- Serve static files (like public/chat.js) ---
app.use(express.static(__dirname + '/public'));

// --- API Endpoints ---

// Plain text
function respondText(req, res) {
  res.send('hi');
}

// JSON
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

// Echo API
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

// Chat App HTML
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// Handle chat message
function respondChat(req, res) {
  const { message } = req.query;
  if (message) chatEmitter.emit('message', message);
  res.end();
}

// Server-Sent Events for live updates
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// --- Register routes ---
app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

// --- Start server ---
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
