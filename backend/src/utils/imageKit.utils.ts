import imageKit from "../configs/imageKit.config";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  crop?: "at_max" | "at_least" | "center" | "maintain_ratio";
  format?: "jpg" | "png" | "webp" | "auto";
}

/**
 * Generate a transformed ImageKit URL from a file path
 */
export const getTransformedImageUrl = (
  filePath: string, 
  options: ImageTransformOptions = {}
): string => {
  const {
    width = 1920,
    height = 1080,
    quality = 80,
    crop = "at_max",
    format = "auto"
  } = options;

  return imageKit.url({
    path: filePath,
    transformation: [{
      height: height.toString(),
      width: width.toString(),
      crop,
      quality: quality.toString(),
      format
    }]
  });
};

/**
 * Generate multiple sizes for responsive images
 */
export const getResponsiveImageUrls = (filePath: string) => {
  return {
    thumbnail: getTransformedImageUrl(filePath, { width: 300, height: 200 }),
    medium: getTransformedImageUrl(filePath, { width: 800, height: 600 }),
    large: getTransformedImageUrl(filePath, { width: 1920, height: 1080 }),
    original: imageKit.url({ path: filePath })
  };
};

/**
 * Validate ImageKit configuration
 */
export const validateImageKitConfig = (): boolean => {
  const requiredEnvVars = [
    'IMAGEKIT_PUBLIC_KEY',
    'IMAGEKIT_PRIVATE_KEY', 
    'IMAGEKIT_URL_ENDPOINT'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing ImageKit environment variables:', missing);
    return false;
  }

  return true;
};
