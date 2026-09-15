import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { ApiError } from '@/lib/api/errors';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_FOLDER = 'real-estate';

export async function uploadImage(file: File) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(500, 'CONFIG_ERROR', 'Server configuration error');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: UPLOAD_FOLDER, resource_type: 'auto' }, (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Empty upload response'));
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });

  return { url: result.secure_url };
}
