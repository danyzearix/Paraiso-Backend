// controllers/horarioController.mjs
import Horario from "../models/horarioSchema.mjs";
import Misa from "../models/misaSchema.mjs";
import moment from "moment-timezone";

import "moment/locale/es.js"; // Importar el idioma español
moment.locale("es"); // Configurar moment para usar español


// Obtener horarios disponibles por misa
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { misaId } = req.params;
    const horarios = await Horario.find({ misaId, estado: "libre" });

    // Convertir fechas a zona horaria local (America/Bogota)
    const horariosTransformados = horarios.map((horario) => ({
      ...horario.toObject(),
      fecha: moment(horario.fecha).tz("America/Bogota").format("YYYY-MM-DD HH:mm"),
    }));

    res.status(200).json(horariosTransformados);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los horarios", error });
  }
};

// Generar horarios a partir de horarios base
export const generarHorarios = async (req, res) => {
  try {
    const { misaId, fecha } = req.body;

    // Buscar la misa
    const misa = await Misa.findById(misaId);
    if (!misa) return res.status(404).json({ message: "Misa no encontrada" });

    // Mapear los días para evitar discrepancias con tildes
    const diasMap = {
      domingo: "domingo",
      lunes: "lunes",
      martes: "martes",
      miércoles: "miercoles",
      jueves: "jueves",
      viernes: "viernes",
      sábado: "sabado",
    };

    // Obtener el nombre del día en español
    const diaNombreOriginal = moment(fecha).tz("America/Bogota").format("dddd").toLowerCase();
    const diaNombre = diasMap[diaNombreOriginal] || diaNombreOriginal;

    console.log("Día interpretado:", diaNombre);

    // Buscar los rangos del día en horariosBase
    const rangos = misa.horariosBase[diaNombre];
    console.log("Rangos obtenidos:", rangos);

    if (!rangos || rangos.length === 0) {
      return res.status(400).json({ message: "Sin horarios configurados para este día" });
    }

    // Generar horarios individuales
    const horariosGenerados = [];
    rangos.forEach((rango) => {
      const [horaInicio, horaFin] = rango.split("-");
      let horaActual = moment.tz(`${fecha} ${horaInicio}`, "America/Bogota");
      const horaFinal = moment.tz(`${fecha} ${horaFin}`, "America/Bogota");

      while (horaActual.isBefore(horaFinal)) {
        horariosGenerados.push({
          misaId,
          fecha: horaActual.toDate(), // Se guarda en UTC
          estado: "libre",
        });
        horaActual.add(misa.duracion, "minutes");
      }
    });

    // Guardar los horarios en la base de datos
    const horariosGuardados = await Horario.insertMany(horariosGenerados);
    res.status(201).json(horariosGuardados);
  } catch (error) {
    console.error("Error al generar los horarios:", error);
    res.status(500).json({ message: "Error interno del servidor", error });
  }
};


// Reservar un horario
export const reservarHorario = async (req, res) => {
  const { id } = req.params; // ID del horario
  const { usuarioId, nombre, email, metodoPago, monto, direccionResidencia, servicioId } = req.body;

  try {
    // Buscar el horario por ID
    const horario = await Horario.findById(id);

    // Validar que exista y que esté en estado "libre"
    if (!horario) {
      return res.status(404).json({ message: "El horario no existe" });
    }

    if (horario.estado !== "libre") {
      return res
        .status(400)
        .json({ message: `El horario ya está ${horario.estado} y no puede ser reservado` });
    }

    // Actualizar estado y añadir la reserva
    horario.estado = "reservado";
    horario.reservas.push({
      usuarioId,
      nombre,
      email,
      direccionResidencia, // Verifica que este campo esté llegando desde el frontend
      servicioId,          // Verifica que este campo esté llegando desde el frontend
      pago: { metodo: metodoPago, monto, estado: "pagado" },
    });

    // Guardar cambios
    await horario.save();
    res.status(200).json({ message: "Horario reservado con éxito", horario });
  } catch (error) {
    console.error("Error al reservar el horario:", error);
    res.status(500).json({ message: "Error al reservar el horario", error });
  }
};

export const obtenerHorarios = async (req, res) => {
  try {
    const { misaId } = req.params;
    const horarios = await Horario.find({ misaId, estado: 'libre' }).lean();
    res.json(horarios);
  } catch (err) {
    console.error('obtenerHorarios error:', err);
    res.status(500).json({ message: 'Error obteniendo horarios' });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findById(id);
    if (!horario) return res.status(404).json({ message: 'Horario no encontrado' });

    const now = new Date();
    const diffHrs = (horario.fecha - now) / (1000 * 60 * 60);
    if (diffHrs > 24) {
      return res.status(400).json({ message: 'Solo se puede cancelar con menos de 24h de anticipación' });
    }

    horario.estado = 'libre';
    horario.reservas = [];  // borramos todas las reservas asociadas
    await horario.save();

    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (err) {
    console.error('cancelarReserva error:', err);
    res.status(500).json({ message: 'Error cancelando reserva' });
  }
};

export const getSlotsReservados = async (req, res) => {
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

    const slotsReservados = await Horario.aggregate([
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
          'reservas.servicioId': {
            $cond: [
              { $gt: [{ $size: '$pago_info' }, 0] },
              { $arrayElemAt: ['$pago_info.servicioId', 0] },
              '$reservas.servicioId'
            ]
          },
          // Inyectamos misaId y fecha dentro de reservas
          'reservas.misaId': { $toString: '$misaId' },
          'reservas.fecha': '$fecha'
        }
      },
      // Proyectamos sólo el subdocumento reservas
      { $project: { reservas: 1 } }
    ]);

    return res.json(slotsReservados);
  } catch (error) {
    console.error('getSlotsReservados error:', error);
    res.status(500).json({ message: 'Error obteniendo slots reservados' });
  }
};