import mongoose from "mongoose";

//Crear el modelo para el usuario
const usuariosSchema = new mongoose.Schema({
    nombre: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  });
  
  const Usuarios = mongoose.model('Usuarios', usuariosSchema);

  export default Usuarios;