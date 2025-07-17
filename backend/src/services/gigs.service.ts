import Gig from '../models/gig.model';
import imageKit from '../configs/imageKit.config';
import { Types } from 'mongoose';

export const uploadImageToImageKit = async (file: Express.Multer.File) => {
    return await imageKit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: '/gigs',
    });
};

export const createGigService = async (data: {
    title: string;
    desc: string;
    price: number;
    category: Types.ObjectId;
    fileId: string;
    imageURL: string;
    userId: Types.ObjectId;
}) => {
    return await Gig.create(data);
};

export const getGigsService = async () => {
    const res = await Gig.find()
        .populate('userId', 'name email')
        .populate('category', 'name');
    return res;
};

export const getGigByIdService = async (id: string) => {
    return await Gig.findById(id)
        .populate('userId', 'name email')
        .populate('category', 'name');
};

export const updateGigService = async (id: string, updateData: any) => {
    const existingGig = await Gig.findById(id);
    let previousFileId = existingGig?.fileId;
    let updatedGig;
    if (updateData.fileId && previousFileId && previousFileId !== updateData.fileId) {
        try {
            await imageKit.deleteFile(previousFileId);
        } catch (err) {
            console.error('Error deleting previous image from ImageKit:', err);
        }
    }
    updatedGig = await Gig.findByIdAndUpdate(id, updateData, { new: true });
    return updatedGig;
};

export const deleteGigService = async (id: string) => {
    const gig = await Gig.findById(id);
    if (!gig)
        return null;

    try {
        await imageKit.deleteFile(gig.fileId);
    } catch (err) {
        console.error('Error deleting image from ImageKit:', err);
        return;
    }
    const deletedGig = await Gig.findByIdAndDelete(id);
    return deletedGig;
};
