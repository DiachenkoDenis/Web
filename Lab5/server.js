const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let history = [];

function randomFloat(min, max, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateBessData() {
  const power = randomFloat(-250, 250, 1);

  const data = {
    timestamp: Date.now(),
    chargeLevel: randomFloat(20, 95, 1),
    power,
    voltage: randomFloat(620, 760, 1),
    current: randomFloat(40, 350, 1),
    temperature: randomFloat(22, 55, 1),
    cycles: Math.floor(randomFloat(450, 900, 0)),
    mode: power >= 0 ? "charging" : "discharging"
  };

  history.push(data);

  if (history.length > 30) {
    history.shift();
  }

  return data;
}

setInterval(generateBessData, 2000);

app.get("/api/bess/current", (req, res) => {
  const data = generateBessData();
  res.json(data);
});

app.get("/api/bess/history", (req, res) => {
  res.json(history);
});

app.get("/api/bess/status", (req, res) => {
  res.json({
    status: "online",
    object: "Battery Energy Storage System",
    lastUpdate: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`BESS сервер запущено на http://localhost:${PORT}`);
});
