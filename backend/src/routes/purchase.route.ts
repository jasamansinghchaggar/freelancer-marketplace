import { Router } from 'express';
import { purchaseGig, getClientPurchases, getFreelancerPurchases } from '../controllers/purchase.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Client purchases a gig
router.post('/:gigId', userMiddleware, purchaseGig);

// Get client purchases
router.get('/client', userMiddleware, getClientPurchases);

// Get freelancer sales
router.get('/freelancer', userMiddleware, getFreelancerPurchases);

export default router;
