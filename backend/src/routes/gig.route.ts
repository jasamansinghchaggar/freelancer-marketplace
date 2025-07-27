import { Router } from 'express';
import multer from 'multer';
import { createGig, getGigs, getGigById, updateGig, deleteGig } from '../controllers/gig.controller';
import { userMiddleware } from '../middlewares/user.middleware';
import { requireRole, requireAuth } from '../middlewares/role.middleware';

const gigsRouter = Router();

// Configure multer with proper limits and memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        fieldSize: 10 * 1024 * 1024, // 10MB field limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Multer error handling middleware
const handleMulterError = (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Unexpected file field'
            });
        }
    }
    if (err.message === 'Only image files are allowed') {
        return res.status(400).json({
            error: err.message
        });
    }
    next(err);
};


gigsRouter.post('/', userMiddleware, requireRole('freelancer'), upload.single('image'), handleMulterError, createGig);
gigsRouter.put('/:id', userMiddleware, requireRole('freelancer'), upload.single('image'), handleMulterError, updateGig);
gigsRouter.delete('/:id', userMiddleware, requireRole('freelancer'), deleteGig);

gigsRouter.get('/', userMiddleware, requireAuth, getGigs);
gigsRouter.get('/:id', userMiddleware, requireAuth, getGigById);

export default gigsRouter;
