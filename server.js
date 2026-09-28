const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

/*

npm init -y
npm install express mysql2

*/

// Allow JSON data
app.use(express.json());


// Serve index.html (from the public folder)
app.use(express.static(path.join(__dirname, "public")));


// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "movie_db"
});


// Test database connection
db.connect((err) => {

    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("Connected to MySQL");

});


// ========================================
// GET - Retrieve all movies
// ========================================

app.get("/api/movies", (req, res) => {

    const sql = "SELECT * FROM movies";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json(results);

    });

});


// ========================================
// GET - Retrieve one movie
// ========================================

app.get("/api/movies/:id", (req, res) => {

    const sql = "SELECT * FROM movies WHERE id = ?";

    db.query(sql, [req.params.id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: `Movie with id ${req.params.id} not found`
            });
        }

        res.json(results[0]);

    });

});


// ========================================
// POST - Insert a movie
// ========================================

app.post("/api/movies", (req, res) => {

    const { title, genre, year } = req.body || {};


    // Return an error if required fields are missing
    const missing = [];
    if (!title || !String(title).trim()) missing.push("title");
    if (!genre || !String(genre).trim()) missing.push("genre");
    if (year === undefined || year === null || String(year).trim() === "") missing.push("year");

    if (missing.length > 0) {
        return res.status(400).json({
            error: `Missing required field(s): ${missing.join(", ")}`
        });
    }

    const yearNumber = Number(year);
    if (!Number.isInteger(yearNumber)) {
        return res.status(400).json({
            error: "year must be a whole number"
        });
    }


    const sql = `
        INSERT INTO movies
        (title, genre, year)
        VALUES (?, ?, ?)
    `;

    const values = [String(title).trim(), String(genre).trim(), yearNumber];


    db.query(sql, values, (err, result) => {

        if (err) {
            return res.status(500).json({
                error: "Database error"
            });
        }

        // The id is created automatically by MySQL (AUTO_INCREMENT)
        res.status(201).json({
            id: result.insertId,
            title: values[0],
            genre: values[1],
            year: values[2]
        });

    });

});


// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

    console.log(
        `Movie API running at http://localhost:${PORT}`
    );

});