import { Router } from 'express';
import {
    createBooking,
    listMyBookings,
    getBookingById
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', listMyBookings);
router.post('/', authorize('client'), createBooking);
router.get('/:id', getBookingById);

export default router;