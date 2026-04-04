import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api/errors'
import { createUserAccount } from '@/server/users/service'
import { validateRegisterInput } from '@/server/users/validators'

export async function POST(request: NextRequest) {
  try {
    const input = validateRegisterInput(await request.json())
    const user = await createUserAccount(input)

    return NextResponse.json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    return errorResponse(error)
  }
}