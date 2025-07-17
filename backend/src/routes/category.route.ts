import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller';
import { userMiddleware } from '../middlewares/user.middleware';
import { requireAuth } from '../middlewares/role.middleware';

const router = Router();

// list categories
// list categories
router.get('/', userMiddleware, requireAuth, getCategories);
// create new category
router.post('/', userMiddleware, requireAuth, createCategory);

export default router;
