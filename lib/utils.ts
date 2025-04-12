import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a thumbnail from an image file
 * @param file The image file to create a thumbnail from
 * @param maxWidth Maximum width of the thumbnail
 * @param maxHeight Maximum height of the thumbnail
 * @returns Promise that resolves to a Blob containing the thumbnail
 */
export function createThumbnail(
  file: File | Blob,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create image and canvas elements
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    // Handle image load error
    img.onerror = () => {
      reject(new Error('Error loading image'));
    };
    
    // Set up image onload handler
    img.onload = () => {
      // Clean up object URL when done
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions and draw resized image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create thumbnail'));
          }
        },
        'image/jpeg',
        0.75
      );
    };
    
    // Load image from file
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}
