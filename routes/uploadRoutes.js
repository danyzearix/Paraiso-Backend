import express from 'express';
import multer from 'multer';
import uploadFile from '../controllers/uploadController.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // Cambia la ruta según tus necesidades
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadFile);

export default router;

