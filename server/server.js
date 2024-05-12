// ----------------------------
// File: server.js
// ----------------------------
const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 5005;

app.use(express.static('build')); // Serve your React app build

// Generate random vessel data
function generateVesselData() {
    const vessels = [];
    for (let i = 0; i < 100000; i++) { // Reduced for demo purposes
        vessels.push({
            id: i,
            longitude: Math.random() * 360 - 180,
            latitude: Math.random() * 180 - 90,
            iconUrl: './arrow.png'
        });
    }
    return vessels;
}

// WebSocket connection for real-time data
wss.on('connection', ws => {
    console.log('Client connected');
    const sendVesselData = () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(generateVesselData()));
        }
    };

    const interval = setInterval(sendVesselData, 2000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
