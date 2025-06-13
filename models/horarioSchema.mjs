import mongoose from "mongoose";

const reservaSchema = new mongoose.Schema({
  usuarioId:          { type: String, required: true },
  nombreComprador:    { type: String, required: true },
  email:              { type: String, required: true },
  celular:            { type: String, required: true },
  tipoIdentificacion: { type: String, required: true },
  numeroDocumento:    { type: String, required: true },
  nombreDestinatario: { type: String, required: true },
  intencionMisa:      { type: String, required: true },
  fechaReserva:       { type: Date,   default: Date.now },
  pago: {
    metodo:           { type: String, enum: ["Tarjeta","PSE","Efectivo"], required: true },
    monto:            { type: Number, required: true },
    estado:           { type: String, enum: ["pendiente","pagado"], default: "pendiente" },
  },
  direccionResidencia: { type: String, required: true },
  servicioId:          { type: String, required: true }
});

const horarioSchema = new mongoose.Schema({
  misaId:   { type: mongoose.Schema.Types.ObjectId, ref: "Misa", required: true },
  fecha:    { type: Date, required: true },
  estado:   { type: String, enum: ["libre","reservado","bloqueado"], default: "libre" },
  reservas: [reservaSchema]
});

export default mongoose.model("Horario", horarioSchema);

