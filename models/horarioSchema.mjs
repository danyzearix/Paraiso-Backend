// models/horarioSchema.js
import mongoose from "mongoose";

const horarioSchema = new mongoose.Schema({
  misaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Misa", // Referencia al modelo Misa
    required: true,
  },
  fecha: {
    type: Date, // Fecha y hora exactas del horario
    required: true,
  },
  estado: {
    type: String,
    enum: ["libre", "reservado", "bloqueado"],
    default: "libre",
  },
  reservas: [
    {
      usuarioId: { type: String }, // ID del usuario que reserva
      nombre: { type: String },
      email: { type: String },
      fechaReserva: { type: Date, default: Date.now },
      pago: {
        metodo: { type: String },
        monto: { type: Number },
        estado: { type: String, enum: ["pendiente", "pagado"], default: "pendiente" },
      },
    },
  ],
});

const Horario = mongoose.model("Horario", horarioSchema);
export default Horario
