// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const WebSocket = require('ws');

// Create an HTTP server and attach WebSocket server to it
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
    console.log('A new client Connected!');
    ws.send('Welcome new Client');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        ws.send('Got your message its: ' + message);
    });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});