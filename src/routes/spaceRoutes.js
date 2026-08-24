import { Router } from 'express';
import {
    getSpaceMetadata,
    listSpaces,
    getMySpaces,
    getSpaceById,
    createSpace,
    updateSpace,
    deleteSpace
} from '../controllers/spaceController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/metadata', getSpaceMetadata);
router.get('/my-spaces', authenticate, authorize('host'), getMySpaces);
router.get('/', authenticate, authorize('client'), listSpaces);
router.post('/', authenticate, authorize('host'), createSpace);
router.get('/:id', getSpaceById);
router.put('/:id', authenticate, authorize('host'), updateSpace);
router.delete('/:id', authenticate, authorize('host'), deleteSpace);

export default router;