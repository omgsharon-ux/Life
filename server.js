const express = require("express");
const fs      = require("fs").promises;
const path    = require("path");

const app       = express();
const PORT      = 3000;
const PLANS_DIR = path.join(__dirname, "meal-plans");

app.use(express.json());
app.use(express.static(__dirname));

// Ensure meal-plans directory exists on startup
fs.mkdir(PLANS_DIR, { recursive: true }).catch(console.error);

// ── SHARED HELPERS ──
function dataFile(name) {
    return path.join(PLANS_DIR, `${name}.json`);
}

async function readJSON(file, fallback) {
    try { return JSON.parse(await fs.readFile(file, "utf8")); }
    catch { return fallback; }
}

async function writeJSON(file, data, res) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
    res.json({ ok: true });
}

// ── WEEK PLANS  (name = date string e.g. "2026-06-16") ──
app.get("/api/plan/:weekKey", async (req, res) =>
    res.json(await readJSON(dataFile(req.params.weekKey), {})));

app.post("/api/plan/:weekKey", async (req, res) =>
    writeJSON(dataFile(req.params.weekKey), req.body, res));

// ── LIST all saved weeks ──
app.get("/api/plans", async (req, res) => {
    try {
        const weeks = (await fs.readdir(PLANS_DIR))
            .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/))
            .map(f => f.replace(".json", ""))
            .sort();
        res.json(weeks);
    } catch { res.json([]); }
});

// ── DINNER HISTORY ──
app.get("/api/history", async (req, res) =>
    res.json(await readJSON(dataFile("dinner-history"), [])));

app.post("/api/history", async (req, res) =>
    writeJSON(dataFile("dinner-history"), req.body, res));

// ── TO DO LIST ──
app.get("/api/todos", async (req, res) =>
    res.json(await readJSON(dataFile("todos"), [])));

app.post("/api/todos", async (req, res) =>
    writeJSON(dataFile("todos"), req.body, res));

app.listen(PORT, () => {
    console.log(`Life Dashboard → http://localhost:${PORT}`);
});
