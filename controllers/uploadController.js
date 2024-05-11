import XLSX from 'xlsx';
import Obituarios from '../models/obituariosSchema.js';

const uploadFile = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const results = XLSX.utils.sheet_to_json(worksheet);

    for (const data of results) {
      // Convertir la hora de decimal a formato HH:MM
      const horas = Math.floor(data.hora * 24);
      const minutos = Math.floor((data.hora * 24 * 60) % 60);
      const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
      
      // Formatear la fecha al formato ISO 8601
      const fecha = new Date(data.fecha).toISOString();

      const formattedData = {
        nombre: data.nombre,
        velacion: data.velacion,
        exequias: data.exequias,
        hora: horaFormateada,
        destino_final: data.destino_final,
        fecha: fecha
      };

      try {
        const nuevoObituario = new Obituarios(formattedData);
        // Guardar el obituario en la base de datos
        await nuevoObituario.save();
      } catch (error) {
        console.error('Error al guardar:', error);
      }
    }

    res.send('Archivo procesado y datos guardados');
  } catch (error) {
    console.error('Error al procesar o guardar el archivo:', error);
    // Puedes verificar el tipo de error y proporcionar una respuesta específica
    if (error instanceof mongoose.Error.ValidationError) {
      // Si es un error de validación de Mongoose
      res.status(400).json({ error: 'Error de validación en el obituario', details: error.errors });
    } else {
      res.status(500).json({ error: 'Error en el servidor al procesar el archivo' });
    }
  }
};

export default uploadFile;
