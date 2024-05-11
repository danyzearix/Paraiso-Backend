import express from 'express';
import multer from 'multer';
import uploadFile from '../controllers/uploadController.mjs'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/upload', upload.single('file'), uploadFile);

export default router;

