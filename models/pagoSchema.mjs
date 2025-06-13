import mongoose from 'mongoose';

const pagoSchema = new mongoose.Schema({
  horarioId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Horario', required: true },
  usuarioId:           { type: String, required: true },
  monto:               { type: Number, required: true },
  nombreComprador:     { type: String, required: true },
  email:               { type: String, required: true },
  celular:             { type: String, required: true },
  tipoIdentificacion:  { type: String, required: true },
  numeroDocumento:     { type: String, required: true },
  nombreDestinatario:  { type: String, required: true },
  intencionMisa:       { type: String, required: true },
  metodoPago:          { type: String, required: true },
  direccionResidencia: { type: String, required: true },
  orderNumber:         { type: String, required: true }, // Campo requerido
}, { timestamps: true });

export default mongoose.model('Pago', pagoSchema);

