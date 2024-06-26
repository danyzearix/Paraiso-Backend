import express from "express";
const router = express.Router();
import { registrarUsuarios, loginUsuarios } from "../controllers/usuariosController.mjs";

//Registrar usuarios
router.post("/registro", registrarUsuarios);
//Login de usuarios
router.post("/login", loginUsuarios);

export default router;