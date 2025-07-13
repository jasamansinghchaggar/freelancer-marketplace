import { Router } from 'express';
import multer from 'multer';
import { createGig, getGigs, getGigById, updateGig, deleteGig } from '../controllers/gig.controller';
import { userMiddleware } from '../middlewares/user.middleware';
import { requireRole, requireAuth } from '../middlewares/role.middleware';

const gigsRouter = Router();
const upload = multer();


gigsRouter.post('/', userMiddleware, requireRole('freelancer'), upload.single('image'), createGig);
gigsRouter.put('/:id', userMiddleware, requireRole('freelancer'), upload.single('image'), updateGig);
gigsRouter.delete('/:id', userMiddleware, requireRole('freelancer'), deleteGig);

gigsRouter.get('/', userMiddleware, requireAuth, getGigs);
gigsRouter.get('/:id', userMiddleware, requireAuth, getGigById);

export default gigsRouter;
