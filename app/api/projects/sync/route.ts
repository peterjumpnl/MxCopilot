import { NextResponse } from 'next/server'
import { MendixApiService } from '@/app/services/mendix-api'
import { ProjectService } from '@/app/services/project'

const MENDIX_API_URL = 'https://cloud.home.mendix.com/api/v4/apps'

interface MendixApp {
  Id: string;
  Name: string;
  ProjectId: string;
  Url: string;
}

const projectService = new ProjectService()

export async function POST() {
  try {
    const apiKeys = await projectService.getStoredApiKeys()

    if (!apiKeys) {
      console.log('No API keys found')
      return NextResponse.json(
        { error: 'API keys not found' },
        { status: 404 }
      )
    }

    console.log('Found API keys, fetching apps...')

    try {
      const mendixApi = new MendixApiService(apiKeys.pat)
      const apps = await mendixApi.getApps()
      
      const projects = await projectService.storeProjects(apps)

      console.log('Successfully stored projects:', projects)
      return NextResponse.json({ projects })
    } catch (apiError: any) {
      console.error('Error fetching from Mendix API:', apiError)
      return NextResponse.json(
        { error: apiError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Top level error:', error)
    return NextResponse.json(
      { error: `Failed to sync Mendix projects: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const projects = await projectService.getAllProjects()
    return NextResponse.json({ projects })
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
