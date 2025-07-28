import { Request, Response } from 'express';
import {
    createGigService,
    deleteGigService,
    getGigByIdService,
    getGigsService,
    updateGigService,
    uploadImageToImageKit,
} from '../services/gigs.service';
import { validateImageWithPreset } from '../utils/imageValidation';
import { findOrCreateCategoryService } from '../services/category.service';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middlewares/user.middleware';

interface MulterRequest extends AuthenticatedRequest {
    file?: Express.Multer.File;
    user?: any;
}

export const createGig = async (req: MulterRequest, res: Response) => {
    try {
        const { title, desc, price, category: categoryName } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            console.log('ERROR: No userId found');
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }
        
        if (!title || !desc || !price || !categoryName) {
            console.log('ERROR: Missing required fields', { title, desc, price, categoryName });
            return res.status(400).json({
                error: 'All fields (title, desc, price, category) are required'
            });
        }
        
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({
                error: 'Image is required'
            });
        }

        // Additional file validation
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                error: 'File size too large. Maximum size is 10MB.'
            });
        }

        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                error: 'Invalid file type. Only images are allowed.'
            });
        }

        // Validate image dimensions using Sharp with preset
        const dimensionValidation = await validateImageWithPreset(req.file, 'gigImage');

        if (!dimensionValidation.isValid) {
            return res.status(400).json({
                error: dimensionValidation.error
            });
        }

        try {
            const uploadResponse = await uploadImageToImageKit(req.file);
            const categoryDoc = await findOrCreateCategoryService(categoryName);
            const categoryId = categoryDoc._id as unknown as Types.ObjectId;
            
            const gig = await createGigService({
                title,
                desc,
                price,
                category: categoryId,
                fileId: uploadResponse.fileId,
                imageURL: uploadResponse.url,
                userId: userId,
            });
            
            res.status(201).json(gig);
        } catch (uploadError: any) {
            console.error('Upload error:', uploadError);
            return res.status(500).json({
                error: uploadError.message || 'Image upload failed'
            });
        }
    } catch (error: any) {
        console.error('Gig creation error:', error);
        res.status(500).json({
            message: "Gig creation failed",
            error: error.message || 'Internal server error'
        });
    }
};

export const getGigs = async (req: Request, res: Response) => {
    try {
        const gigs = await getGigsService();
        res.json(gigs);
    } catch (error) {
        res.status(500).json({
            message: "Gig fetching failed",
            error: error
        });
    }
};

export const getGigById = async (req: Request, res: Response) => {
    try {
        const gig = await getGigByIdService(req.params.id);
        if (!gig)
            return res.status(404).json({
                error: 'Gig not found'
            });
        res.json(gig);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch gig",
            error: error
        });
    }
};

export const updateGig = async (req: MulterRequest, res: Response) => {
    try {
        const existingGig = await getGigByIdService(req.params.id);
        if (!existingGig) {
            return res.status(404).json({
                error: 'Gig not found'
            });
        }

        const updateData: any = { ...req.body };
        if (updateData.category) {
            const categoryDoc = await findOrCreateCategoryService(updateData.category);
            updateData.category = categoryDoc._id;
        }
        if (req.file) {
            // Validate image dimensions for update as well
            const dimensionValidation = await validateImageWithPreset(req.file, 'gigImage');

            if (!dimensionValidation.isValid) {
                return res.status(400).json({
                    error: dimensionValidation.error
                });
            }

            const uploadResponse = await uploadImageToImageKit(req.file);
            updateData.imageURL = uploadResponse.url;
            updateData.fileId = uploadResponse.fileId;
        }
        const gig = await updateGigService(req.params.id, updateData);
        res.json(gig);
    } catch (error) {
        res.status(500).json({
            message: "Gig update failed",
            error: error
        });
    }
};

export const deleteGig = async (req: Request, res: Response) => {
    try {
        const gig = await deleteGigService(req.params.id);
        if (!gig)
            return res.status(404).json({
                error: 'Gig not found'
            });
        res.json({
            message: 'Gig deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: "Gig deletion failed",
            error: error
        });
    }
};