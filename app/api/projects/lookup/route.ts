import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json()

    // Get API key for Mendix API calls
    const apiKeys = await prisma.apiKeys.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!apiKeys?.pat) {
      return NextResponse.json(
        { error: 'Mendix PAT not found' },
        { status: 401 }
      )
    }

    // Call Mendix API to get project details
    const response = await fetch(`https://api.mendix.com/projects/${projectId}`, {
      headers: {
        'Authorization': `MxToken ${apiKeys.pat}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch project details')
    }

    const projectData = await response.json()

    // Store or update project in database
    const project = await prisma.mendixProject.upsert({
      where: { id: projectId },
      update: {
        name: projectData.name,
        url: projectData.url,
        description: projectData.description,
      },
      create: {
        id: projectId,
        name: projectData.name,
        url: projectData.url,
        description: projectData.description,
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Project lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to look up project' },
      { status: 500 }
    )
  }
}
