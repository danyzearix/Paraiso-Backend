import express from "express";
const router = express.Router();
import {obtenerObituarios, guardarObituarios} from "../controllers/obituariosController.js"

//Obtener datos 
router.get("/", obtenerObituarios);
//Guardar obituarios individual
router.post("/", guardarObituarios);

export default router;