import Usuarios from "../models/usersSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registrarUsuarios = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        console.log(req.body);
    
        // Verificar si el usuario ya existe
        const existingUser = await Usuarios.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'El usuario ya existe' });
        }
    
        console.log('Password:', password);
    
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);
    
        // Crear un nuevo usuario
        const usuario = new Usuarios({
          nombre,
          email,
          password: hashedPassword
        });
    
        // Guardar el usuario en la base de datos
        await usuario.save();
    
        res.status(201).json({ message: 'Usuario registrado con éxito' });
      } catch (error) {
        console.error('Error detalle:', error);
        res.status(500).json({ message: 'Error en el servidor' });
      }
};

export default registrarUsuarios;


const loginUsuarios = async(req, res) => {
    try {
        const { email, password } = req.body;
    
        // Buscar al usuario por email
        const usuario = await Usuarios.findOne({ email });
        if (!usuario) {
          return res.status(400).send('Credenciales no válidas');
        }
    
        // Verificar la contraseña
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
          return res.status(400).send('Credenciales no válidas');
        }
    
        // Crear y enviar el token
        const token = jwt.sign({ _id: usuario._id }, 'tu_secreto', { expiresIn: '1h' });
        res.header('auth-token', token).send(token);
      } catch (error) {
        res.status(500).send('Error en el servidor');
      }
};

export {registrarUsuarios, loginUsuarios};