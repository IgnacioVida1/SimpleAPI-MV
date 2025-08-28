const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos:', err.message);
  } else {
    console.log('Base de datos SQLite conectada');

    db.run(`
      CREATE TABLE IF NOT EXISTS ESTUDIANTES (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        FIRSTNAME TEXT NOT NULL,
        LASTNAME TEXT NOT NULL,
        GENDER TEXT NOT NULL,
        AGE TEXT NOT NULL
      )
    `);
  }
});

app.post('/students', (req, res) => {

    const {firstname, lastname, gender, age} = req.body;

    if (!firstname || !lastname || !gender || !age) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const sql = `INSERT INTO ESTUDIANTES (FIRSTNAME, LASTNAME, GENDER, AGE) VALUES (?, ?, ?, ?)`;
    const values = [firstname, lastname, gender, age];

    db.run(sql, values, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({ id: this.lastID, message: 'Estudiante creado exitosamente', datos: req.body });
    });

});

app.put('/students/:id', (req, res) => {
    
    const id = (req.params.id) ? req.params.id : .1;
    const { firstname, lastname, gender, age } = req.body;

    if (!firstname || !lastname || !gender || !age) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const sql = `UPDATE ESTUDIANTES SET FIRSTNAME = ?, LASTNAME = ?, GENDER = ?, AGE = ? WHERE ID = ?`;
    const values = [firstname, lastname, gender, age, id];

    db.run(sql, values, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === -1) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({ message: 'Estudiante actualizado exitosamente', datos: req.body });
    });
});

app.get('/students', (req, res) => {

    const sql = `SELECT * FROM ESTUDIANTES`;

    db.all(sql, [], (err, rows) => {
        if (err)
        {
            return res.status(500).json({ error: err.message });
        }

        res.status(200).json({ estudiantes: rows });
    });
});

app.delete('/students/:id', (req, res) => {

    const id = (req.params.id) ? req.params.id : -1;
    const sql = `DELETE FROM ESTUDIANTES WHERE ID = ?`;

    db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === -1) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json({ message: 'Estudiante eliminado correctamente' });
  });
});

app.get('/students/:id', (req, res) => {

    const id = (req.params.id) ? req.params.id : -1;
    const sql = `SELECT * FROM ESTUDIANTES WHERE ID = ${id}`;

    db.all(sql, [], (err, rows) => {
        if (err)
        {
            return res.status(500).json({ error: err.message });
        }

        if (this.changes === -1) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({ estudiantes: rows });
    });
});

const PORT = 8000;
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en http://${HOST}:${PORT}`);
});
