// models/misaSchema.js
import mongoose from "mongoose";

const misaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  capacidad: {
    type: Number,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  duracion: {
    type: Number, // Duración en minutos
    required: true,
  },
  tiempoMinCompra: {
    type: Number, // Tiempo mínimo de compra en horas
    required: true,
  },
  horariosBase: {
    type: Object, // Ej: { lunes: ["09:00-16:00"], martes: ["09:00-16:00"] }
    required: true,
  },
});

const Misa = mongoose.model("Misa", misaSchema);
export default Misa;
