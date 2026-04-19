const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "chp-plants.json");

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }

    const rawData = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(rawData || "[]");
  } catch (error) {
    console.error("Помилка читання файлу:", error.message);
    return [];
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Помилка запису файлу:", error.message);
    return false;
  }
}

function validateChpPlant(data, isPartial = false) {
  const allowedFuelTypes = ["gas", "coal", "biomass"];
  const allowedStatuses = ["active", "standby", "maintenance"];

  const requiredFields = [
    "name",
    "electricPower",
    "thermalPower",
    "fuelType",
    "fuelConsumption",
    "efficiency",
    "emissions",
    "steamPressure",
    "status"
  ];

  if (!isPartial) {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        return `Відсутнє обов'язкове поле: ${field}`;
      }
    }
  }
  if (data.name !== undefined && typeof data.name !== "string") {
    return "Поле name повинно бути рядком";
  }
  const numericFields = [
    "electricPower",
    "thermalPower",
    "fuelConsumption",
    "efficiency",
    "emissions",
    "steamPressure"
  ];

  for (const field of numericFields) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "number" || Number.isNaN(data[field]))
    ) {
      return `Поле ${field} повинно бути числом`;
    }
  }

  if (data.fuelType !== undefined && !allowedFuelTypes.includes(data.fuelType)) {
    return "fuelType повинен бути: gas, coal або biomass";
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    return "status повинен бути: active, standby або maintenance";
  }

  if (
    data.efficiency !== undefined &&
    (data.efficiency < 0 || data.efficiency > 100)
  ) {
    return "ККД повинен бути в межах від 0 до 100";
  }

  return null;
}

app.get("/api", (req, res) => {
  res.json({
    message: "REST API для моніторингу ТЕЦ працює",
    endpoints: [
      "GET /api/chp-plants",
      "GET /api/chp-plants/:id",
      "GET /api/chp-plants/:id/fuel",
      "GET /api/chp-plants/:id/emissions",
      "POST /api/chp-plants",
      "POST /api/chp-plants/:id/readings",
      "PUT /api/chp-plants/:id",
      "PATCH /api/chp-plants/:id",
      "DELETE /api/chp-plants/:id"
    ]
  });
});

app.get("/api/chp-plants", (req, res) => {
  let plants = readData();
  const { status, fuelType, search, sortBy, order } = req.query;

  if (status) {
    plants = plants.filter((plant) => plant.status === status);
  }

  if (fuelType) {
    plants = plants.filter((plant) => plant.fuelType === fuelType);
  }

  if (search) {
    const query = search.toLowerCase();
    plants = plants.filter((plant) => plant.name.toLowerCase().includes(query));
  }

  if (sortBy) {
    plants.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return order === "desc" ? 1 : -1;
      if (a[sortBy] > b[sortBy]) return order === "desc" ? -1 : 1;
      return 0;
    });
  }

  res.status(200).json(plants);
});

app.get("/api/chp-plants/:id", (req, res) => {
  const plants = readData();
  const plant = plants.find((p) => p.id === parseInt(req.params.id, 10));

  if (!plant) {
    return res.status(404).json({
      error: "ТЕЦ не знайдено",
      id: req.params.id
    });
  }

  res.status(200).json(plant);
});

app.get("/api/chp-plants/:id/fuel", (req, res) => {
  const plants = readData();
  const plant = plants.find((p) => p.id === parseInt(req.params.id, 10));

  if (!plant) {
    return res.status(404).json({
      error: "ТЕЦ не знайдено"
    });
  }

  res.status(200).json({
    id: plant.id,
    name: plant.name,
    fuelType: plant.fuelType,
    fuelConsumption: plant.fuelConsumption,
    unit: plant.fuelType === "gas" ? "тис. м³/год" : "т/год"
  });
});

app.get("/api/chp-plants/:id/emissions", (req, res) => {
  const plants = readData();
  const plant = plants.find((p) => p.id === parseInt(req.params.id, 10));

  if (!plant) {
    return res.status(404).json({
      error: "ТЕЦ не знайдено"
    });
  }

  let level = "normal";
  if (plant.emissions > 30) {
    level = "high";
  } else if (plant.emissions > 20) {
    level = "warning";
  }

  res.status(200).json({
    id: plant.id,
    name: plant.name,
    emissions: plant.emissions,
    unit: "т/год",
    level
  });
});

app.post("/api/chp-plants", (req, res) => {
  const validationError = validateChpPlant(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const plants = readData();

  const newPlant = {
    id: plants.length > 0 ? Math.max(...plants.map((p) => p.id)) + 1 : 1,
    name: req.body.name,
    electricPower: req.body.electricPower,
    thermalPower: req.body.thermalPower,
    fuelType: req.body.fuelType,
    fuelConsumption: req.body.fuelConsumption,
    efficiency: req.body.efficiency,
    emissions: req.body.emissions,
    steamPressure: req.body.steamPressure,
    status: req.body.status
  };

  plants.push(newPlant);

  if (!writeData(plants)) {
    return res.status(500).json({ error: "Не вдалося зберегти дані" });
  }

  res.status(201).json(newPlant);
});

app.post("/api/chp-plants/:id/readings", (req, res) => {
  const plants = readData();
  const index = plants.findIndex((p) => p.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: "ТЕЦ не знайдено" });
  }

  const {
    electricPower,
    thermalPower,
    fuelConsumption,
    efficiency,
    emissions,
    steamPressure,
    status
  } = req.body;

  if (
    electricPower === undefined &&
    thermalPower === undefined &&
    fuelConsumption === undefined &&
    efficiency === undefined &&
    emissions === undefined &&
    steamPressure === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      error: "Не передано жодного параметра для оновлення показів"
    });
  }

  const updatedPlant = {
    ...plants[index],
    ...(electricPower !== undefined && { electricPower }),
    ...(thermalPower !== undefined && { thermalPower }),
    ...(fuelConsumption !== undefined && { fuelConsumption }),
    ...(efficiency !== undefined && { efficiency }),
    ...(emissions !== undefined && { emissions }),
    ...(steamPressure !== undefined && { steamPressure }),
    ...(status !== undefined && { status })
  };

  const validationError = validateChpPlant(updatedPlant, true);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  plants[index] = updatedPlant;

  if (!writeData(plants)) {
    return res.status(500).json({ error: "Не вдалося зберегти нові покази" });
  }

  res.status(201).json({
    message: "Покази успішно записані",
    data: plants[index]
  });
});

app.put("/api/chp-plants/:id", (req, res) => {
  const plants = readData();
  const index = plants.findIndex((p) => p.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: "ТЕЦ не знайдено" });
  }

  const validationError = validateChpPlant(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  plants[index] = {
    id: parseInt(req.params.id, 10),
    name: req.body.name,
    electricPower: req.body.electricPower,
    thermalPower: req.body.thermalPower,
    fuelType: req.body.fuelType,
    fuelConsumption: req.body.fuelConsumption,
    efficiency: req.body.efficiency,
    emissions: req.body.emissions,
    steamPressure: req.body.steamPressure,
    status: req.body.status
  };

  if (!writeData(plants)) {
    return res.status(500).json({ error: "Не вдалося оновити дані" });
  }

  res.status(200).json(plants[index]);
});

app.patch("/api/chp-plants/:id", (req, res) => {
  const plants = readData();
  const index = plants.findIndex((p) => p.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: "ТЕЦ не знайдено" });
  }

  const updatedPlant = {
    ...plants[index],
    ...req.body,
    id: parseInt(req.params.id, 10)
  };

  const validationError = validateChpPlant(updatedPlant, true);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  plants[index] = updatedPlant;

  if (!writeData(plants)) {
    return res.status(500).json({ error: "Не вдалося частково оновити дані" });
  }

  res.status(200).json(plants[index]);
});


app.delete("/api/chp-plants/:id", (req, res) => {
  const plants = readData();
  const index = plants.findIndex((p) => p.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: "ТЕЦ не знайдено" });
  }

  const deletedPlant = plants.splice(index, 1)[0];

  if (!writeData(plants)) {
    return res.status(500).json({ error: "Не вдалося видалити дані" });
  }

  res.status(200).json({
    message: "ТЕЦ успішно видалено",
    plant: deletedPlant
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Маршрут не знайдено"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 REST API сервер запущено на http://localhost:${PORT}`);
});
