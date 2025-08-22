import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Controller('upload')
export class UploadController {
  @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'realestate', resource_type: 'image' },
        (error, result) => {
            if (error) return reject(error);
            resolve({ url: result!.secure_url });
        }
        );

        // Pipe the buffer into the stream
        Readable.from(file.buffer).pipe(uploadStream);
    });
    }
}