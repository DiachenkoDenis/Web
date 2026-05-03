let powerChart = null;
let history = [];

const chargeLevelEl = document.getElementById("chargeLevel");
const chargeFillEl = document.getElementById("chargeFill");
const chargeStatusEl = document.getElementById("chargeStatus");

const powerValueEl = document.getElementById("powerValue");
const modeValueEl = document.getElementById("modeValue");

const temperatureValueEl = document.getElementById("temperatureValue");
const temperatureFillEl = document.getElementById("temperatureFill");
const temperatureStatusEl = document.getElementById("temperatureStatus");

const paramsTableEl = document.getElementById("paramsTable");
const apiStatusEl = document.getElementById("apiStatus");
const lastUpdateEl = document.getElementById("lastUpdate");
const refreshBtn = document.getElementById("refreshBtn");

function initChart() {
  const ctx = document.getElementById("powerChart");

  powerChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Потужність заряду/розряду (кВт)",
          data: [],
          borderWidth: 3,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          title: {
            display: true,
            text: "кВт (+ заряд / - розряд)"
          }
        },
        x: {
          title: {
            display: true,
            text: "Час"
          }
        }
      }
    }
  });
}

function updateCharge(chargeLevel) {
  chargeLevelEl.textContent = `${chargeLevel} %`;
  chargeFillEl.style.width = `${chargeLevel}%`;

  if (chargeLevel < 30) {
    chargeFillEl.style.background = "#ef4444";
    chargeStatusEl.textContent = "Низький рівень заряду";
  } else if (chargeLevel < 60) {
    chargeFillEl.style.background = "#facc15";
    chargeStatusEl.textContent = "Середній рівень заряду";
  } else {
    chargeFillEl.style.background = "#22c55e";
    chargeStatusEl.textContent = "Нормальний рівень заряду";
  }
}

function updateTemperature(temperature) {
  temperatureValueEl.textContent = `${temperature} °C`;

  const percent = Math.min((temperature / 60) * 100, 100);
  temperatureFillEl.style.width = `${percent}%`;

  if (temperature < 35) {
    temperatureFillEl.style.background = "#22c55e";
    temperatureStatusEl.textContent = "Стан: норма";
  } else if (temperature < 45) {
    temperatureFillEl.style.background = "#facc15";
    temperatureStatusEl.textContent = "Стан: підвищена температура";
  } else {
    temperatureFillEl.style.background = "#ef4444";
    temperatureStatusEl.textContent = "Стан: критична температура";
  }
}

function updatePower(data) {
  powerValueEl.textContent = `${data.power} кВт`;
  modeValueEl.textContent =
    data.mode === "charging" ? "Режим: заряд" : "Режим: розряд";
}

function updateTable(data) {
  paramsTableEl.innerHTML = `
    <tr>
      <td>Рівень заряду</td>
      <td>${data.chargeLevel}</td>
      <td>%</td>
    </tr>
    <tr>
      <td>Потужність заряду/розряду</td>
      <td>${data.power}</td>
      <td>кВт</td>
    </tr>
    <tr>
      <td>Напруга батареї</td>
      <td>${data.voltage}</td>
      <td>В</td>
    </tr>
    <tr>
      <td>Струм</td>
      <td>${data.current}</td>
      <td>А</td>
    </tr>
    <tr>
      <td>Температура батарейного блоку</td>
      <td>${data.temperature}</td>
      <td>°C</td>
    </tr>
    <tr>
      <td>Кількість циклів заряду</td>
      <td>${data.cycles}</td>
      <td>циклів</td>
    </tr>
  `;
}

function updateChart(data) {
  const time = new Date(data.timestamp).toLocaleTimeString("uk-UA");

  powerChart.data.labels.push(time);
  powerChart.data.datasets[0].data.push(data.power);

  if (powerChart.data.labels.length > 20) {
    powerChart.data.labels.shift();
    powerChart.data.datasets[0].data.shift();
  }

  powerChart.update();
}

async function loadCurrentData() {
  try {
    const response = await fetch("/api/bess/current");

    if (!response.ok) {
      throw new Error("Помилка API");
    }

    const data = await response.json();

    updateCharge(data.chargeLevel);
    updatePower(data);
    updateTemperature(data.temperature);
    updateTable(data);
    updateChart(data);

    apiStatusEl.textContent = "API працює коректно";
    lastUpdateEl.textContent = new Date(data.timestamp).toLocaleTimeString("uk-UA");
  } catch (error) {
    apiStatusEl.textContent = "Помилка підключення до API";
    console.error(error);
  }
}

refreshBtn.addEventListener("click", loadCurrentData);

document.addEventListener("DOMContentLoaded", () => {
  initChart();
  loadCurrentData();
  setInterval(loadCurrentData, 2000);
});
