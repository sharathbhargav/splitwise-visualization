import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload } from '../middleware/multer';

const router = Router();

router.post('/', upload.single('file'), uploadController.handleUpload);

export const uploadRoutes = router;
