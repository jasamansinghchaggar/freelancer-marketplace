import { Router } from 'express';
import { completeProfile, getProfileStatus } from '../controllers/profile.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const profileRouter = Router();

profileRouter.get('/status', userMiddleware, getProfileStatus);

profileRouter.post('/complete', userMiddleware, completeProfile);

export default profileRouter;
