import Counter from '../models/counterSchema.mjs';

/**
 * Incrementa y retorna la siguiente secuencia para el nombre dado.
 * @param {String} name Nombre de la secuencia (e.g. 'pago')
 * @returns {Promise<String>} Número secuencial, formateado con ceros a la izquierda
 */
export async function generarOrderNumber(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return String(counter.seq).padStart(6, '0');
}
