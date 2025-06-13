import Horario from '../models/horarioSchema.mjs';

/**
 * GET /api/reservas?from=...&to=...
 * Devuelve todas las reservas aplanadas en el rango,
 * o todas si no se pasan from/to.
 */
export const listarReservas = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filtro = { estado: 'reservado' };
    if (from && to) {
      const desde = new Date(from);
      const hasta = new Date(to);
      if (!isNaN(desde) && !isNaN(hasta)) {
        filtro.fecha = { $gte: desde, $lte: hasta };
      }
    }

const result = await Horario.aggregate([
  { $match: filtro },
  { $unwind: { path: '$reservas', preserveNullAndEmptyArrays: false } },
  {
    $lookup: {
      from: 'pagos',
      localField: '_id',
      foreignField: 'horarioId',
      as: 'pago_info'
    }
  },
  {
    $addFields: {
      'reservas.direccionResidencia': {
        $cond: [
          { $gt: [{ $size: '$pago_info' }, 0] },
          { $arrayElemAt: ['$pago_info.direccionResidencia', 0] },
          '$reservas.direccionResidencia'
        ]
      },
      'reservas.pago': {
        metodo: { $arrayElemAt: ['$pago_info.metodo', 0] },
        monto:  { $arrayElemAt: ['$pago_info.monto', 0] }
      }
    }
  },
  // ─── STAGE FINAL PLANO ───────────────────────────────────────
  {
    $replaceRoot: {
      newRoot: {
        $mergeObjects: [
          '$reservas',
          {
            // traemos misaId y fecha al nivel superior
            fecha:  '$fecha',
            misaId: { $toString: '$misaId' }
          }
        ]
      }
    }
  }
]);

console.log('>>> aggregate result sample:', JSON.stringify(result[0], null, 2));
return res.json(result);
    console.log('>>> aggregate result sample:', JSON.stringify(result[0], null, 2));
    // Ejemplo de salida: { reservas: { _id: "...", nombreComprador: "...", misaId: "6762...", fecha: "2025-06-13T14:00:00.000Z", … } }
    return res.json(result);

  } catch (err) {
    console.error('listarReservas error:', err);
    return res.status(500).json({ message: 'Error listando reservas' });
  }
};
