import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const apiKeys = await prisma.apiKeys.findFirst({
      where: { id: 1 }
    })

    if (!apiKeys) {
      return NextResponse.json({ hasKeys: false })
    }

    return NextResponse.json({
      hasKeys: true,
      pat: apiKeys.pat,
      openaiKey: apiKeys.openaiKey
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check API keys' },
      { status: 500 }
    )
  }
}
