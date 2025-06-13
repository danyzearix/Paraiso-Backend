import express from 'express';
import {
  obtenerHorarios,
  cancelarReserva,
  getSlotsReservados
} from '../controllers/horarioController.mjs';

const router = express.Router();

// Nueva ruta para obtener los slots reservados
router.get('/reservados', getSlotsReservados);

// Devuelve slots libres para la misa dada
router.get('/:misaId', obtenerHorarios);

// Cancela una reserva concreta (libera el horario)
router.put('/:id/cancel', cancelarReserva);

export default router;

