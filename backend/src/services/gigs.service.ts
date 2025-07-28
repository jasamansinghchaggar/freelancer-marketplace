import Gig from "../models/gig.model";
import imageKit from "../configs/imageKit.config";
import { Types } from "mongoose";
import { getTransformedImageUrl, validateImageKitConfig } from "../utils/imageKit.utils";
import { validateImageWithSharp, validateImageWithPreset } from "../utils/imageValidation";

// Re-export for backward compatibility
export const validateImageDimensions = validateImageWithSharp;

export const uploadImageToImageKit = async (file: Express.Multer.File) => {
  try {
    // Validate ImageKit configuration first
    if (!validateImageKitConfig()) {
      throw new Error("ImageKit configuration is invalid. Please check your environment variables.");
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate image dimensions using Sharp with preset
    const validationResult = await validateImageWithPreset(file, 'gigImage');

    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }

    console.log('Image validation passed:', validationResult.metadata);

    // Try uploading with basic quality compression
    try {
      const uploadResponse = await imageKit.upload({
        file: file.buffer,
        fileName: `${Date.now()}_${file.originalname.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`,
        folder: "/gigs",
        useUniqueFileName: true,
      });

      return {
        ...uploadResponse,
        // Return a transformed URL for display purposes
        transformedUrl: getTransformedImageUrl(uploadResponse.filePath)
      };
    } catch (transformError) {
      console.warn('Upload with transformation failed, trying without transformation:', transformError);
      
      // Fallback: upload without any transformation
      const uploadResponse = await imageKit.upload({
        file: file.buffer,
        fileName: `${Date.now()}_${file.originalname.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`,
        folder: "/gigs",
        useUniqueFileName: true,
        // No transformation at all
      });

      return {
        ...uploadResponse,
        transformedUrl: getTransformedImageUrl(uploadResponse.filePath)
      };
    }
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    .populate("userId", "name email")
    .populate("category", "name");
  return res;
};

export const getGigByIdService = async (id: string) => {
  return await Gig.findById(id)
    .populate("userId", "name email")
    .populate("category", "name");
};

export const updateGigService = async (id: string, updateData: any) => {
  const existingGig = await Gig.findById(id);
  let previousFileId = existingGig?.fileId;
  let updatedGig;
  if (
    updateData.fileId &&
    previousFileId &&
    previousFileId !== updateData.fileId
  ) {
    try {
      await imageKit.deleteFile(previousFileId);
    } catch (err) {
      console.error("Error deleting previous image from ImageKit:", err);
    }
  }
  updatedGig = await Gig.findByIdAndUpdate(id, updateData, { new: true });
  return updatedGig;
};

export const deleteGigService = async (id: string) => {
  const gig = await Gig.findById(id);
  if (!gig) return null;

  try {
    await imageKit.deleteFile(gig.fileId);
  } catch (err) {
    console.error("Error deleting image from ImageKit:", err);
    return;
  }
  const deletedGig = await Gig.findByIdAndDelete(id);
  return deletedGig;
};
