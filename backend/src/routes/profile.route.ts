import { Router } from 'express';
import { completeProfile, getProfileStatus, setPublicKey } from '../controllers/profile.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const profileRouter = Router();

profileRouter.get('/status', userMiddleware, getProfileStatus);
profileRouter.post('/complete', userMiddleware, completeProfile);
profileRouter.post('/publicKey', userMiddleware, setPublicKey);

export default profileRouter;
