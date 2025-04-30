const { stat } = require("fs");

const ws = new WebSocket('ws://${location.host}');
let stationId = null;
let receivedUnits = [];
let round = 1;
const totalUnits = 20;
const container = document.getElementById('unitContainer');
const log = document.getElementById('log');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === 'assign') {
    stationId = msg.stationId;
    document.getElementById('stationId').innerText = `${stationId}`;
    if (stationId === 0) {
      startRound();
    }
  }

  if (msg.type === 'unitForward' && msg.to === stationId) {
    logMsg(`Received unit ${msg.unit} from Stattion ${msg.from}`);
    receivedUnits.push(msg.unit);
    renderUnits();

    processUnitsIfReady();
  }
};

function startRound() {
  for (let i = 0; i < totalUnits; i++) {
    setTimeout(() => {
      sendUnit(i, stationId, stationId + 1);
    }, i * 100);
  }
}

function sendUnit(unit, from, to) {
  ws.send(JSON.stringify({
    from,
    to,
    unit,
    timestamp: Date.now()
  }));
}

function processUnitsIfReady() {
  let batchSize = round === 1 ? totalUnits : round === 2 ? 5 : 1 ;
  if (receivedUnits.length >= batchSize) {
    const unitsToSend = receivedUnits.splice(0, batchSize);
    unitsToSend.forEach((unit, index) => {
      setTimeout(() => {
        sendUnit(unit, stationId, stationId + 1);
      }, index * 100);
    });
    renderUnits();
  }
}

function renderUnits() {
  container.innerHTML = receivedUnits.map(u => `<div class="unit">${u}</div>`).join('');
}

function logMsg(msg) {
  const p = document.createElement('p');
  p.innerText = msg;
  log.appendChild(p);
}
