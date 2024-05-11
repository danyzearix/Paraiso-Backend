import express from "express";
const router = express.Router();
import {obtenerObituarios, guardarObituarios} from "../controllers/obituariosController.mjs"

//Obtener datos 
router.get("/", obtenerObituarios);
//Guardar obituarios individual
router.post("/", guardarObituarios);

export default router;