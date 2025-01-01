import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function POST(request: Request) {
  try {
    const { projectId, projectName } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Record project access with current timestamp
    const accessedProject = await prisma.accessedProject.upsert({
      where: { id: projectId },
      update: {
        accessedAt: new Date(),
        name: projectName
      },
      create: {
        id: projectId,
        accessedAt: new Date(),
        name: projectName
      },
    })

    return NextResponse.json({ success: true, accessedProject })
  } catch (error: any) {
    console.error('Error recording project access:', error)
    return NextResponse.json(
      { error: 'Failed to record project access' },
      { status: 500 }
    )
  }
}
