import Obituarios from "../models/obituariosSchema.mjs";

const obtenerObituarios = async (req, res) => {
  try {
    const obituarios = await Obituarios.find();
    res.status(200).json(obituarios);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
};

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

const editarObituario = async (req, res) => {
  try {
    const { id } = req.params;
    const obituarioActualizado = await Obituarios.findByIdAndUpdate(id, req.body, { new: true });
    if (!obituarioActualizado) {
      return res.status(404).json({ error: 'Obituario no encontrado' });
    }
    res.status(200).json(obituarioActualizado);
  } catch (error) {
    console.error('Error al editar el obituario:', error);
    res.status(500).json({ error: 'Error al editar el obituario' });
  }
};

const eliminarObituario = async (req, res) => {
  try {
    const { id } = req.params;
    const obituarioEliminado = await Obituarios.findByIdAndDelete(id);
    if (!obituarioEliminado) {
      return res.status(404).json({ error: 'Obituario no encontrado' });
    }
    res.status(200).json({ message: 'Obituario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el obituario:', error);
    res.status(500).json({ error: 'Error al eliminar el obituario' });
  }
};

export { obtenerObituarios, guardarObituarios, editarObituario, eliminarObituario };
