import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controllers/uploadController';

const router = Router();

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Handle CSV file upload
router.post('/', upload.single('file'), uploadController.handleUpload);

export { router as uploadRouter };