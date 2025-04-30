const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let stationOrder = [];

wss.on('connection', (ws) => {
  const stationId = clients.length;
  clients.push(ws);
  console.log(`Client connected: ${stationId}`);
  stationOrder.push(stationId);
  console.log(`Station order: ${stationOrder}`);

  ws.send(JSON.stringify({ type: 'assign', stationId }));

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    console.log(`Received message from station ${stationId}:`, msg);

    if (msg.type === 'unitForward') {
      const nextStation = stattionOrder[msg.to];
      if(clients[nextStation]) {
        clients[nextStation].send(JSON.stringify(msg));
      }
    }

    clients.forEach((client, index) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'state', data: msg}));
      }
    });
  });
});

app.use(express.static('public'));

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
