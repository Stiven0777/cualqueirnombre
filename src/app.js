import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(express.json());

app.use(cors());

app.get("/songs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM songs");

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontro el recurso",
      });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/songs/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query("SELECT * FROM songs WHERE id_song = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No se encontro el recurso",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/songs", async (req, res) => {
  const { title, singer, image } = req.body;

  if (typeof title !== "string") {
    return res.status(400).json({
      message: "Peticion invalida",
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO songs(title, singer, image) VALUES($1, $2, $3) RETURNING *",
      [title, singer, image]
    );

    res.status(201).json({
      message: "cancion reproducida exitosamente",
      body: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.put("/songs/:id", async (req, res) => {
  const id = req.params.id;
  const { title, singer, image } = req.body;

  try {
    const result = await pool.query(
      "UPDATE songs SET title = $1, singer = $2, image = $3  WHERE id_song = $4",
      [title, singer, image, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Recurso no encontrado",
      });
    }

    res.json({
      message: "Se actualizo la cancion",
    });
    
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/songs/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query("DELETE FROM songs WHERE id_song = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontro el recurso",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    message: "Cancion no encontrada",
  });
});

const port = process.env.PORT ?? 5000;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
