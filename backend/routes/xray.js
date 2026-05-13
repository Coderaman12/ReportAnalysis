import { Router } from 'express';
import { analyzeXray } from '../services/xrayAnalyzer.js';
import { makeUploader } from '../lib/multerFactory.js';
import { MAX_UPLOAD_BYTES, IMAGE_MIME_TYPES } from '../lib/constants.js';

const router = Router();

const upload = makeUploader({
  fieldName: 'xray',
  allowedMimes: IMAGE_MIME_TYPES,
  maxBytes: MAX_UPLOAD_BYTES,
});

router.post('/', upload, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use field name "xray".' });
    }
    const result = await analyzeXray({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
