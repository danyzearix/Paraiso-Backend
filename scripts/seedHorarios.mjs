import mongoose from 'mongoose';
import cron from 'node-cron';
import connectDB from '../config/mongoConfig.mjs';
import Horario from '../models/horarioSchema.mjs';
import Misa from '../models/misaSchema.mjs';

// Conexión a MongoDB
await connectDB();
console.log('🔌 Conectado a MongoDB (config/mongoConfig)');

/**
 * Genera slots de disponibilidad para los próximos 30 días según los rangos base
 * de todas las misas definidas en la colección.
 */
async function generarDisponibilidad() {
  console.log('⏱️  Generando disponibilidad de horarios para todas las misas...');

  const misas = await Misa.find().lean();
  if (!misas.length) {
    console.warn('⚠️ No hay misas configuradas.');
    return;
  }

  const ahora = new Date();
  const msPorDia = 24 * 60 * 60 * 1000;

  for (const misa of misas) {
    for (let diaOffset = 0; diaOffset < 30; diaOffset++) {
      const fechaActual = new Date(ahora.getTime() + diaOffset * msPorDia);
      // Normalizar nombre del día sin tildes
      const nombreDia = fechaActual
        .toLocaleDateString('es-CO', { weekday: 'long' })
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

      const rangos = misa.horariosBase[nombreDia] || [];
      if (!rangos.length) continue;

      for (const rango of rangos) {
        const [inicioStr, finStr] = rango.split('-');
        const [hInicio, mInicio] = inicioStr.split(':').map(Number);
        const [hFin, mFin] = finStr.split(':').map(Number);

        // Fecha de inicio y fin del rango
        const inicio = new Date(fechaActual);
        inicio.setHours(hInicio, mInicio, 0, 0);

        const fin = new Date(fechaActual);
        fin.setHours(hFin, mFin, 0, 0);

        // Crear slots en pasos de duracion minutos
        let slot = new Date(inicio);
        while (slot < fin) {
          const diffHrs = (slot - ahora) / (1000 * 60 * 60);
          const estado = diffHrs >= misa.tiempoMinCompra ? 'libre' : 'bloqueado';

          await Horario.findOneAndUpdate(
            { misaId: misa._id, fecha: slot },
            { $setOnInsert: { misaId: misa._id, fecha: slot, estado } },
            { upsert: true, setDefaultsOnInsert: true }
          ).exec();

          // Avanzar al siguiente slot
          slot = new Date(slot.getTime() + misa.duracion * 60 * 1000);
        }
      }
    }
  }

  console.log('✅ Disponibilidad para todas las misas actualizada');
}

// Cron diario a medianoche
cron.schedule('0 0 * * *', () => {
  generarDisponibilidad().catch(console.error);
});

// Ejecutar al iniciar
generarDisponibilidad().catch(console.error);

