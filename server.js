const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve index.html (and anything else) from the /public folder
app.use(express.static(path.join(__dirname, "public")));

// Temporary storage: a plain JavaScript array.
// Everything here disappears when the server restarts.
let movies = [
  { id: 1, title: "Interstellar", genre: "Science Fiction", year: 2014 },
  { id: 2, title: "Avengers: Endgame", genre: "Action", year: 2019 },
  { id: 3, title: "Coco", genre: "Animation", year: 2017 },
];
let nextId = 4;

// GET /api/movies - retrieve all movies
app.get("/api/movies", (req, res) => {
  res.json(movies);
});

// GET /api/movies/:id - retrieve one movie
app.get("/api/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return res.status(404).json({ error: `Movie with id ${req.params.id} not found` });
  }

  res.json(movie);
});

// POST /api/movies - add a new movie
app.post("/api/movies", (req, res) => {
  const { title, genre, year } = req.body || {};

  // Return an error if required fields are missing
  const missing = [];
  if (!title || !String(title).trim()) missing.push("title");
  if (!genre || !String(genre).trim()) missing.push("genre");
  if (year === undefined || year === null || String(year).trim() === "") missing.push("year");

  if (missing.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing required field(s): ${missing.join(", ")}` });
  }

  const yearNumber = Number(year);
  if (!Number.isInteger(yearNumber)) {
    return res.status(400).json({ error: "year must be a whole number" });
  }

  // id is assigned automatically
  const newMovie = {
    id: nextId++,
    title: String(title).trim(),
    genre: String(genre).trim(),
    year: yearNumber,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.listen(PORT, () => {
  console.log(`Movie API running at http://localhost:${PORT}`);
});