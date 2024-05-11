import Obituarios from "../models/obituariosSchema.js"
import { DateTime } from 'luxon';

const obtenerObituarios = async (req, res) => {
  try {
    const obituarios = await Obituarios.find();
    res.status(200).json(obituarios);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
}

const guardarObituarios = async (req, res) => {
  try {
    const nuevoObituario = new Obituarios(req.body);
    await nuevoObituario.save();
    res.status(201).json(nuevoObituario);
  } catch (error) {
    console.error('Error al guardar el obituario:', error);
    res.status(500).json({ error: 'Error al guardar el obituario' });
  }
};

export { obtenerObituarios, guardarObituarios };
