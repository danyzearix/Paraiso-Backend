import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connectDB from './config/mongoConfig.mjs';
import obituariosRoutes from "./routes/obituariosRoutes.mjs"
import uploadRoutes from "./routes/uploadRoutes.mjs"
import usuariosRoutes from "./routes/usuariosRoutes.mjs";

import path from 'path';
import { fileURLToPath } from 'url';



//Middlewares
const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT)

//Llamar funcion que conecta a la DB 
connectDB();

// Permitir solicitudes desde cualquier origen
app.use(cors());
// O permitir solicitudes solo desde el origen específico donde se encuentra tu aplicación React

// Parsear el cuerpo de las solicitudes a JSON
app.use(bodyParser.json());

// Obtén la ruta del archivo actual a partir de import.meta.url
const __filename = fileURLToPath(import.meta.url);
// Usa path.dirname para obtener el directorio del archivo actual
const __dirname = path.dirname(__filename);

// Ahora puedes usar __dirname para construir rutas de manera segura
const directory = path.join(__dirname, 'public', 'uploads');

console.log(directory); // Verifica que la ruta es correcta
//Usar carpeta public
app.use( express.static("public"));

//Rutas 
app.use("/api/obituarios", obituariosRoutes)
app.use("/api", uploadRoutes);
app.use("/api/usuarios", usuariosRoutes)


//Middleware para verificar token jeje
function verifyToken(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Acceso denegado');

  try {
    const verified = jwt.verify(token, 'tu_secreto');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Token inválido');
  }
}

app.use('/FormularioObituarios', verifyToken);

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});


