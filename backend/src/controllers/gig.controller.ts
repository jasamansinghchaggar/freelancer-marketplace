import { Request, Response } from 'express';
import {
    createGigService,
    deleteGigService,
    getGigByIdService,
    getGigsService,
    updateGigService,
    uploadImageToImageKit,
} from '../services/gigs.service';
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
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }
        if (!title || !desc || !price || !categoryName) {
            return res.status(400).json({
                error: 'All fields (title, desc, price, category) are required'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                error: 'Image is required'
            });
        }

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
    } catch (error) {
        res.status(500).json({
            message: "Gig creation failed",
            error: error
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