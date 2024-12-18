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
  const { id } = req.params;
  const { usuarioId, nombre, email, metodoPago, monto } = req.body;

  try {
    const horario = await Horario.findById(id);
    if (!horario || horario.estado !== "libre") {
      return res.status(400).json({ message: "El horario no está disponible" });
    }

    horario.estado = "reservado";
    horario.reservas.push({
      usuarioId,
      nombre,
      email,
      pago: { metodo: metodoPago, monto, estado: "pagado" },
    });

    await horario.save();
    res.status(200).json({ message: "Horario reservado con éxito", horario });
  } catch (error) {
    res.status(500).json({ message: "Error al reservar el horario", error });
  }
};
