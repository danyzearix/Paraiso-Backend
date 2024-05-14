import express from "express";
const router = express.Router();
import { obtenerObituarios, guardarObituarios, editarObituario, eliminarObituario } from "../controllers/obituariosController.mjs";

// Obtener datos
router.get("/", obtenerObituarios);

// Guardar obituarios individual
router.post("/", guardarObituarios);

// Editar obituarios
router.put("/:id", editarObituario);

// Eliminar obituarios
router.delete("/:id", eliminarObituario);

export default router;
