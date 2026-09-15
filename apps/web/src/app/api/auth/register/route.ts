import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api/errors'
import { parseJsonBody } from '@/lib/api/request'
import { createUserAccount } from '@/server/users/service'
import { validateRegisterInput } from '@/server/users/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody<unknown>(request)
    const input = validateRegisterInput(body)
    const user = await createUserAccount(input)

    return NextResponse.json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    return errorResponse(error)
  }
}