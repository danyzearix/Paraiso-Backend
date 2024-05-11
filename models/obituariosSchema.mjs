import mongoose from "mongoose";

// Definir el esquema de datos
const obituariosSchema = new mongoose.Schema({
    nombre: String,
    velacion: String,
    exequias: String,
    hora: String,
    destino_final: String,
    fecha: String // Cambiado a Date
});

// Crear el modelo basado en el esquema
const Obituarios = mongoose.model('Obituarios', obituariosSchema);

export default Obituarios;
