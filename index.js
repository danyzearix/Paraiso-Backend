import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connectDB from './config/mongoConfig.js';
import obituariosRoutes from "./routes/obituariosRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
import usuariosRoutes from "./routes/usuariosRoutes.js";

//Middlewares
const app = express();
const PORT = process.env.PORT || 3000;



//Llamar funcion que conecta a la DB 
connectDB();

// Permitir solicitudes desde cualquier origen
app.use(cors());
// O permitir solicitudes solo desde el origen específico donde se encuentra tu aplicación React

// Parsear el cuerpo de las solicitudes a JSON
app.use(bodyParser.json());

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


