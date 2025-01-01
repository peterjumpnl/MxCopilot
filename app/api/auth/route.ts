import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { pat, openaiKey } = await request.json()

    // Store or update API keys
    const apiKeys = await prisma.apiKeys.upsert({
      where: { id: 1 },
      update: {
        pat,
        openaiKey,
      },
      create: {
        pat,
        openaiKey,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store API keys' },
      { status: 500 }
    )
  }
}
