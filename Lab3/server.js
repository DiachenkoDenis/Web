const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data", "plants.json");

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }

    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Помилка читання даних:", error);
    return [];
  }
}

function writeData(data) {
  try {
    const dir = path.dirname(DATA_FILE);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Помилка запису даних:", error);
    return false;
  }
}

function isValidEdrpou(edrpou) {
  return /^\d{8}$/.test(edrpou);
}

app.get("/api/plants", (req, res) => {
  const plants = readData();
  res.json(plants);
});

app.post("/api/plants", (req, res) => {
  try {
    const {
      enterprise,
      edrpou,
      plantType,
      power,
      license,
      location,
      notes
    } = req.body;

    if (!enterprise || !edrpou || !plantType || !power || !license) {
      return res.status(400).json({
        success: false,
        message: "Заповніть усі обов'язкові поля"
      });
    }

    if (!isValidEdrpou(edrpou)) {
      return res.status(400).json({
        success: false,
        message: "ЄДРПОУ повинен містити рівно 8 цифр"
      });
    }

    const numericPower = Number(power);

    if (Number.isNaN(numericPower) || numericPower <= 0) {
      return res.status(400).json({
        success: false,
        message: "Потужність повинна бути більшою за 0"
      });
    }

    const newPlant = {
      id: Date.now().toString(),
      enterprise: enterprise.trim(),
      edrpou: edrpou.trim(),
      plantType: plantType.trim(),
      power: numericPower,
      license: license.trim(),
      location: location ? location.trim() : "",
      notes: notes ? notes.trim() : "",
      createdAt: new Date().toISOString()
    };

    const plants = readData();
    plants.push(newPlant);

    if (!writeData(plants)) {
      throw new Error("Не вдалося зберегти дані");
    }

    res.status(201).json({
      success: true,
      message: "Генеруючу установку успішно додано",
      data: newPlant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка обробки даних на сервері",
      error: error.message
    });
  }
});

app.delete("/api/plants/:id", (req, res) => {
  try {
    const plants = readData();
    const filteredPlants = plants.filter((plant) => plant.id !== req.params.id);

    if (plants.length === filteredPlants.length) {
      return res.status(404).json({
        success: false,
        message: "Запис не знайдено"
      });
    }

    if (!writeData(filteredPlants)) {
      throw new Error("Не вдалося оновити файл");
    }

    res.json({
      success: true,
      message: "Запис успішно видалено"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Помилка видалення запису",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
