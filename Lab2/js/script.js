let autoUpdateInterval = null;
let autoUpdateEnabled = false;

function randomFloat(min, max, decimals = 1) {
  return (Math.random() * (max - min) + min).toFixed(decimals);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSensorData() {
  const bearingStates = ["Справний", "Попередження", "Несправний"];

  return {
    waterLevel: parseFloat(randomFloat(100, 120, 1)),
    flowRate: parseFloat(randomFloat(50, 200, 1)),
    turbineSpeed: parseFloat(randomFloat(100, 150, 1)),
    powerOutput: parseFloat(randomFloat(0, 50, 1)),
    gatePosition: randomInt(0, 100),
    bearingState: bearingStates[randomInt(0, bearingStates.length - 1)],
    vibration: parseFloat(randomFloat(0, 12, 2))
  };
}

function getNumericStatus(value, normalMin, normalMax, totalMin, totalMax) {
  if (value >= normalMin && value <= normalMax) {
    return "normal";
  }

  const warningOffsetMin = (normalMin - totalMin) * 0.5;
  const warningOffsetMax = (totalMax - normalMax) * 0.5;

  if (
    (value >= normalMin - warningOffsetMin && value < normalMin) ||
    (value > normalMax && value <= normalMax + warningOffsetMax)
  ) {
    return "warning";
  }

  return "danger";
}

function getGateStatus(position) {
  if (position >= 20 && position <= 80) {
    return "normal";
  }
  if ((position >= 10 && position < 20) || (position > 80 && position <= 90)) {
    return "warning";
  }
  return "danger";
}

function getBearingStatus(state) {
  if (state === "Справний") return "normal";
  if (state === "Попередження") return "warning";
  return "danger";
}

function getVibrationStatus(value) {
  if (value <= 5) return "normal";
  if (value <= 8) return "warning";
  return "danger";
}

function statusText(status) {
  if (status === "normal") return "Норма";
  if (status === "warning") return "Попередження";
  return "Критично";
}

function applyStatus(elementId, status) {
  const element = document.getElementById(elementId);
  element.className = `badge-status ${status}`;
  element.textContent = statusText(status);
}

function formatTime(date) {
  return date.toLocaleTimeString("uk-UA");
}

function updateDisplay(data) {
  document.getElementById("waterLevel").textContent = data.waterLevel;
  document.getElementById("flowRate").textContent = data.flowRate;
  document.getElementById("turbineSpeed").textContent = data.turbineSpeed;
  document.getElementById("powerOutput").textContent = data.powerOutput;
  document.getElementById("gatePosition").textContent = data.gatePosition;
  document.getElementById("bearingState").textContent = data.bearingState;
  document.getElementById("vibration").textContent = data.vibration;

  const waterLevelStatus = getNumericStatus(data.waterLevel, 105, 118, 100, 120);
  const flowRateStatus = getNumericStatus(data.flowRate, 80, 180, 50, 200);
  const turbineSpeedStatus = getNumericStatus(data.turbineSpeed, 110, 140, 100, 150);
  const powerOutputStatus = getNumericStatus(data.powerOutput, 10, 45, 0, 50);
  const gateStatus = getGateStatus(data.gatePosition);
  const bearingStatus = getBearingStatus(data.bearingState);
  const vibrationStatus = getVibrationStatus(data.vibration);

  applyStatus("statusWaterLevel", waterLevelStatus);
  applyStatus("statusFlowRate", flowRateStatus);
  applyStatus("statusTurbineSpeed", turbineSpeedStatus);
  applyStatus("statusPowerOutput", powerOutputStatus);
  applyStatus("statusGatePosition", gateStatus);
  applyStatus("statusBearingState", bearingStatus);
  applyStatus("statusVibration", vibrationStatus);

  const allStatuses = [
    waterLevelStatus,
    flowRateStatus,
    turbineSpeedStatus,
    powerOutputStatus,
    gateStatus,
    bearingStatus,
    vibrationStatus
  ];

  let overall = "normal";
  if (allStatuses.includes("danger")) {
    overall = "danger";
  } else if (allStatuses.includes("warning")) {
    overall = "warning";
  }

  applyStatus("overallStatus", overall);
  document.getElementById("lastUpdate").textContent = formatTime(new Date());
}

function manualUpdate() {
  const data = generateSensorData();
  updateDisplay(data);
}

function toggleAutoUpdate() {
  const button = document.getElementById("autoUpdateBtn");

  if (!autoUpdateEnabled) {
    autoUpdateInterval = setInterval(() => {
      manualUpdate();
    }, 3000);

    autoUpdateEnabled = true;
    button.textContent = "Вимкнути автооновлення";
  } else {
    clearInterval(autoUpdateInterval);
    autoUpdateEnabled = false;
    button.textContent = "Увімкнути автооновлення";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  manualUpdate();
});
