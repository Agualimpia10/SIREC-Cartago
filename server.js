const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Para leer los datos del formulario HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

// 1. Conexión a la Base de Datos SQLite
const db = new sqlite3.Database(path.join(__dirname, 'cartago_economia.db'), (err) => {
    if (err) return console.error("Error al crear la BD:", err.message);
    console.log('¡Base de datos SQL (cartago_economia.db) conectada!');
});

// Inicializar tablas del MER
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Sectores (
        id_sector INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Comercios (
        id_comercio INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_com TEXT NOT NULL,
        nit_rut TEXT NOT NULL UNIQUE,
        direccion TEXT NOT NULL,
        telefono TEXT,
        id_sector INTEGER,
        FOREIGN KEY (id_sector) REFERENCES Sectores(id_sector)
    )`);

    // Insertar sectores 
    db.get("SELECT COUNT(*) as count FROM Sectores", [], (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO Sectores (nombre) VALUES 
                ('Bordados, Confección y Textiles'),
                ('Gastronomía y Cafés Especiales'),
                ('Turismo, Hotelería y Cultura')`);
        }
    });
});

//  RUTA POST 
app.post('/registrar', (req, res) => {
    const { nombre_com, nit_rut, direccion, telefono, id_sector } = req.body;
    
    const sqlQuery = `INSERT INTO Comercios (nombre_com, nit_rut, direccion, telefono, id_sector) VALUES (?, ?, ?, ?, ?)`;

    db.run(sqlQuery, [nombre_com, nit_rut, direccion, telefono, id_sector], function(err) {
        // Aseguramos que la respuesta se interprete como HTML real en cualquier navegador
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        if (err) {
            console.error("Error de SQL:", err.message);
            return res.status(500).send(`
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h2 style="color: red;">Error al guardar en la base de datos</h2>
                    <p>El NIT/RUT ya podría estar registrado o faltan campos obligatorios.</p>
                    <p style="color: #666; font-size: 14px;">Detalle: ${err.message}</p>
                    <br>
                    <a href="/" style="padding: 10px 20px; background: #0056b3; color: white; text-decoration: none; border-radius: 5px;">Volver al formulario</a>
                </div>
            `);
        }
        
        // Respuesta 
        res.send(`
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #249e48;">¡Registro Exitoso desde la Terminal!</h1>
                <p>El comercio <strong>${nombre_com}</strong> se guardó correctamente en el archivo SQL (cartago_economia.db).</p>
                <br>
                <a href="/" style="padding: 10px 20px; background: #0056b3; color: white; text-decoration: none; border-radius: 5px;">Censar otro negocio</a>
            </div>
        `);
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`Servidor de Cartago listo en: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});
