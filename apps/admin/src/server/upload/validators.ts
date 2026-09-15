import { ApiError } from '@/lib/api/errors';

export function validateUploadFile(formData: FormData) {
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'No file provided');
  }

  return file;
}
