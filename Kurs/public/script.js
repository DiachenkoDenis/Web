const calcType = document.getElementById("calcType");
const inputs = document.getElementById("inputs");
const calculateBtn = document.getElementById("calculateBtn");
const clearBtn = document.getElementById("clearBtn");
const message = document.getElementById("message");
const resultBox = document.getElementById("resultBox");
const resultText = document.getElementById("resultText");
const formulaText = document.getElementById("formulaText");

function renderInputs() {
  const type = calcType.value;
  message.textContent = "";
  resultBox.classList.add("hidden");

  if (type === "power") {
    inputs.innerHTML = `
      <label for="voltage">Напруга U (В)</label>
      <input type="number" id="voltage" placeholder="Наприклад, 220" min="0" step="any">

      <label for="current">Струм I (А)</label>
      <input type="number" id="current" placeholder="Наприклад, 5" min="0" step="any">
    `;
  } else if (type === "current") {
    inputs.innerHTML = `
      <label for="power">Потужність P (Вт)</label>
      <input type="number" id="power" placeholder="Наприклад, 1000" min="0" step="any">

      <label for="voltage">Напруга U (В)</label>
      <input type="number" id="voltage" placeholder="Наприклад, 220" min="0" step="any">
    `;
  } else if (type === "resistance") {
    inputs.innerHTML = `
      <label for="voltage">Напруга U (В)</label>
      <input type="number" id="voltage" placeholder="Наприклад, 220" min="0" step="any">

      <label for="current">Струм I (А)</label>
      <input type="number" id="current" placeholder="Наприклад, 5" min="0" step="any">
    `;
  }
}

function getNumberValue(id) {
  const element = document.getElementById(id);
  if (!element) return NaN;
  return parseFloat(element.value);
}

function showError(text) {
  message.textContent = text;
  resultBox.classList.add("hidden");
}

function showResult(result, formula) {
  message.textContent = "";
  resultText.textContent = result;
  formulaText.textContent = formula;
  resultBox.classList.remove("hidden");
}

function calculate() {
  const type = calcType.value;

  if (type === "power") {
    const voltage = getNumberValue("voltage");
    const current = getNumberValue("current");

    if (isNaN(voltage) || isNaN(current)) {
      showError("Будь ласка, заповніть усі поля.");
      return;
    }

    if (voltage <= 0 || current <= 0) {
      showError("Значення повинні бути більшими за нуль.");
      return;
    }

    const power = voltage * current;
    showResult(
      `Потужність: ${power.toFixed(2)} Вт`,
      `Формула: P = U × I = ${voltage} × ${current}`
    );
  }

  if (type === "current") {
    const power = getNumberValue("power");
    const voltage = getNumberValue("voltage");

    if (isNaN(power) || isNaN(voltage)) {
      showError("Будь ласка, заповніть усі поля.");
      return;
    }

    if (power <= 0 || voltage <= 0) {
      showError("Значення повинні бути більшими за нуль.");
      return;
    }

    const current = power / voltage;
    showResult(
      `Струм: ${current.toFixed(2)} А`,
      `Формула: I = P / U = ${power} / ${voltage}`
    );
  }

  if (type === "resistance") {
    const voltage = getNumberValue("voltage");
    const current = getNumberValue("current");

    if (isNaN(voltage) || isNaN(current)) {
      showError("Будь ласка, заповніть усі поля.");
      return;
    }

    if (voltage <= 0 || current <= 0) {
      showError("Значення повинні бути більшими за нуль.");
      return;
    }

    const resistance = voltage / current;
    showResult(
      `Опір: ${resistance.toFixed(2)} Ом`,
      `Формула: R = U / I = ${voltage} / ${current}`
    );
  }
}

function clearForm() {
  renderInputs();
  message.textContent = "";
  resultBox.classList.add("hidden");
}

calcType.addEventListener("change", renderInputs);
calculateBtn.addEventListener("click", calculate);
clearBtn.addEventListener("click", clearForm);

renderInputs();
