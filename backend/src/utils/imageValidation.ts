import sharp from 'sharp';

export interface ImageValidationOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width/height ratio
  aspectRatioTolerance?: number; // tolerance for aspect ratio (default: 0.1)
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
    aspectRatio: number;
  };
}

export const validateImageWithSharp = async (
  file: Express.Multer.File,
  options: ImageValidationOptions = {}
): Promise<ImageValidationResult> => {
  try {
    // Default validation options
    const {
      minWidth = 100,
      minHeight = 100,
      maxWidth = 4000,
      maxHeight = 4000,
      aspectRatio,
      aspectRatioTolerance = 0.1,
      allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'],
      maxFileSize = 10 * 1024 * 1024, // 10MB default
    } = options;

    // Validate file size first (cheaper check)
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum size: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB. Current: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Get image metadata using Sharp
    const metadata = await sharp(file.buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        error: "Unable to read image dimensions. Please ensure the file is a valid image."
      };
    }

    // Validate format
    if (metadata.format && !allowedFormats.includes(metadata.format)) {
      return {
        isValid: false,
        error: `Invalid image format '${metadata.format}'. Allowed formats: ${allowedFormats.join(', ')}`
      };
    }

    // Validate minimum dimensions
    if (metadata.width < minWidth || metadata.height < minHeight) {
      return {
        isValid: false,
        error: `Image dimensions too small. Minimum size: ${minWidth}x${minHeight}px. Current: ${metadata.width}x${metadata.height}px`
      };
    }

    // Validate maximum dimensions
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return {
        isValid: false,
        error: `Image dimensions too large. Maximum size: ${maxWidth}x${maxHeight}px. Current: ${metadata.width}x${metadata.height}px`
      };
    }

    // Validate aspect ratio if specified
    if (aspectRatio) {
      const currentRatio = metadata.width / metadata.height;
      
      if (Math.abs(currentRatio - aspectRatio) > aspectRatioTolerance) {
        return {
          isValid: false,
          error: `Invalid aspect ratio. Expected: ${aspectRatio.toFixed(2)}:1 (±${(aspectRatioTolerance * 100).toFixed(0)}%), Current: ${currentRatio.toFixed(2)}:1`
        };
      }
    }

    return {
      isValid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        size: file.size,
        aspectRatio: metadata.width / metadata.height
      }
    };
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: false,
      error: "Failed to validate image. Please ensure the file is a valid image format."
    };
  }
};

// Predefined validation presets for common use cases
export const ImageValidationPresets: Record<string, ImageValidationOptions> = {
  // For gig images - larger, flexible ratio
  gigImage: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 4000,
    maxHeight: 4000,
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  
  // For profile avatars - smaller, square preferred
  avatar: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 1000,
    maxHeight: 1000,
    aspectRatio: 1, // Square
    aspectRatioTolerance: 0.2, // 20% tolerance
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  
  // For banners - wide format
  banner: {
    minWidth: 800,
    minHeight: 200,
    maxWidth: 3000,
    maxHeight: 1000,
    aspectRatio: 3, // 3:1 ratio (wide)
    aspectRatioTolerance: 0.3,
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
    maxFileSize: 8 * 1024 * 1024, // 8MB
  },
  
  // For thumbnails - small, flexible
  thumbnail: {
    minWidth: 50,
    minHeight: 50,
    maxWidth: 500,
    maxHeight: 500,
    allowedFormats: ['jpeg', 'jpg', 'png', 'webp'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
  }
};

// Helper function to validate using presets
export const validateImageWithPreset = async (
  file: Express.Multer.File,
  preset: keyof typeof ImageValidationPresets
): Promise<ImageValidationResult> => {
  return validateImageWithSharp(file, ImageValidationPresets[preset]);
};
