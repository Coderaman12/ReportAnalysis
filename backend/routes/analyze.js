import { Router } from 'express';
import multer from 'multer';
import { analyzeReport } from '../services/analyzer.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Unsupported file type. Upload PDF, JPG, PNG, or WEBP.'));
  },
});

router.post('/', upload.single('report'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "report".' });
    }
    const patientNotes = (req.body.notes || '').toString().slice(0, 2000);
    const result = await analyzeReport({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
      patientNotes,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
