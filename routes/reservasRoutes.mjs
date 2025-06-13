import express from 'express';
import { listarReservas } from '../controllers/reservasController.mjs';

const router = express.Router();

// Listar todas las reservas aplanadas en el rango de fechas
router.get('/', listarReservas);

export default router;
