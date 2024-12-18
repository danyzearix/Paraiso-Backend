// controllers/misaController.mjs
import Misa from "../models/misaSchema.mjs";

// Obtener todas las misas
export const getMisas = async (req, res) => {
  try {
    const misas = await Misa.find();
    res.status(200).json(misas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las misas", error });
  }
};

// Crear una nueva misa
export const createMisa = async (req, res) => {
  try {
    const { nombre, capacidad, precio, duracion, tiempoMinCompra, horariosBase } = req.body;

    const nuevaMisa = new Misa({
      nombre,
      capacidad,
      precio,
      duracion,
      tiempoMinCompra,
      horariosBase,
    });

    const misaGuardada = await nuevaMisa.save();
    res.status(201).json(misaGuardada);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la misa", error });
  }
};
