const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/articles", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT articles.id, articles.title, articles.content, articles.author_name,
             articles.created_at, categories.name AS category
      FROM articles
      LEFT JOIN categories ON articles.category_id = categories.id
      ORDER BY articles.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання статей" });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories");
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка отримання категорій" });
  }
});


app.get("/api/formulas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM formulas");
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка отримання формул" });
  }
});


app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, category_id, author_name } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Назва і текст статті обов’язкові" });
    }

    const [result] = await db.query(
      "INSERT INTO articles (title, content, category_id, author_name) VALUES (?, ?, ?, ?)",
      [title, content, category_id || 1, author_name || "Користувач"]
    );

    res.json({
      message: "Статтю додано",
      articleId: result.insertId
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка додавання статті" });
  }
});


app.post("/api/calculations", async (req, res) => {
  try {
    const { type, input_data, result } = req.body;

    if (!type || !input_data || !result) {
      return res.status(400).json({ message: "Не всі дані передані" });
    }

    await db.query(
      "INSERT INTO calculations (type, input_data, result) VALUES (?, ?, ?)",
      [type, JSON.stringify(input_data), result]
    );

    res.json({ message: "Розрахунок збережено" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка збереження розрахунку" });
  }
});



app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
