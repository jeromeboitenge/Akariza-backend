import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'akariza/products'
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, and WebP are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Max dimensions
            { quality: 'auto' }, // Auto quality
            { fetch_format: 'auto' }, // Auto format (WebP when supported)
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new BadRequestException('Failed to upload image'));
          } else {
            resolve(result.secure_url);
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'akariza/products'
  ): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract public_id from URL
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        return false;
      }

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  private extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/akariza/products/abc123.jpg
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;

      // Get everything after 'upload/v1234567890/'
      const pathParts = parts.slice(uploadIndex + 2);
      const publicIdWithExt = pathParts.join('/');
      
      // Remove file extension
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      return publicId;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedUrl(
    imageUrl: string,
    width?: number,
    height?: number,
    quality: string = 'auto'
  ): string {
    try {
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) return imageUrl;

      const transformations = [];
      if (width || height) {
        transformations.push(`w_${width || 'auto'},h_${height || 'auto'},c_limit`);
      }
      transformations.push(`q_${quality}`);
      transformations.push('f_auto');

      return cloudinary.url(publicId, {
        transformation: transformations.join(','),
        secure: true,
      });
    } catch (error) {
      console.error('Error generating optimized URL:', error);
      return imageUrl;
    }
  }
}
