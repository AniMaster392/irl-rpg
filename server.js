const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "database.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get("/api/data", (req, res) => {
  res.json(readDB());
});

app.post("/api/complete", (req, res) => {
  const db = readDB();
  const quest = db.quests.find(q => q.id === req.body.id);

  if (!quest) return res.status(404).json({ error: "Quest not found" });

  db.xp += quest.xp;

  if (db.xp >= db.level * 100) {
    db.xp -= db.level * 100;
    db.level += 1;
  }

  writeDB(db);
  res.json(db);
});

app.listen(PORT, () => {
  console.log(`IRL RPG running at http://localhost:${PORT}`);
});