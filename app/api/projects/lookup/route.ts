import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { MendixPlatformService } from '@/app/services/mendix-platform-api'

const platformService = new MendixPlatformService()

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json()

    // First try to get from database
    const existingProject = await prisma.mendixProject.findUnique({
      where: { id: projectId }
    })

    if (existingProject) {
      return NextResponse.json({ project: existingProject })
    }

    // Get API keys
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

    let projectData

    // Try Mendix REST API first
    try {
      const response = await fetch(`https://api.mendix.com/projects/${projectId}`, {
        headers: {
          'Authorization': `MxToken ${apiKeys.pat}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        projectData = await response.json()
      }
    } catch (error) {
      console.log('REST API failed, trying Platform SDK...')
    }

    // If REST API fails, try Platform SDK
    if (!projectData) {
      try {
        await platformService.initialize(apiKeys.pat)
        projectData = await platformService.getProjectDetails(projectId)
      } catch (error) {
        console.error('Both APIs failed to fetch project:', error)
        throw new Error('Failed to fetch project details from both APIs')
      }
    }

    // Store in database
    const project = await prisma.mendixProject.upsert({
      where: { id: projectId },
      update: {
        name: projectData.name,
        url: projectData.url || '',
        description: projectData.description || null,
      },
      create: {
        id: projectId,
        name: projectData.name,
        url: projectData.url || '',
        description: projectData.description || null,
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
