import express from "express";
import {
  getHorariosDisponibles,
  generarHorarios,
  reservarHorario,
} from "../controllers/horarioController.mjs";

const router = express.Router();

router.get("/:misaId", getHorariosDisponibles);
router.post("/", generarHorarios);
router.put("/:id/reservar", reservarHorario);

export default router;
