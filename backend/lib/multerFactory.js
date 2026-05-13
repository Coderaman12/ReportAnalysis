import multer from 'multer';

export function makeUploader({ fieldName, allowedMimes, maxBytes }) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) return cb(null, true);
      const list = allowedMimes
        .map((m) => m.split('/')[1].toUpperCase())
        .join(', ');
      cb(new Error(`Unsupported file type. Upload ${list}.`));
    },
  });
  return upload.single(fieldName);
}
