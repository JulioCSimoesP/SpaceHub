import { Router } from 'express';
import { uploadImages, deleteImage } from '../controllers/uploadController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate, authorize('host'));
router.post('/', upload.array('images', 12), uploadImages);
router.delete('/', deleteImage);

export default router;