import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api/errors';
import { requireAuthenticatedUser } from '@/lib/api/auth';
import { uploadImage } from '@/server/upload/service';
import { validateUploadFile } from '@/server/upload/validators';

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedUser();

    const formData = await request.formData();
    const file = validateUploadFile(formData);
    const result = await uploadImage(file);

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
