import { NextResponse } from 'next/server'
import { MendixPlatformClient, setPlatformConfig } from "mendixplatformsdk";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json()

    // Get the stored PAT token
    const apiKeys = await prisma.apiKeys.findFirst({
      where: { id: 1 }
    })

    if (!apiKeys) {
      return NextResponse.json(
        { error: 'API keys not found' },
        { status: 404 }
      )
    }

    // Configure Mendix SDK
    setPlatformConfig({
      mendixToken: apiKeys.pat,
    })

    const client = new MendixPlatformClient()
    const project = client.getApp(projectId)
    const workingCopy = await project.createTemporaryWorkingCopy("main")
    const model = await workingCopy.openModel()

    // Get all modules
    const allModules = await model.allModules()
    const moduleInfo = allModules.map(module => ({
      name: module.name,
      type: module.structureTypeName
    }))

    return NextResponse.json({
      success: true,
      modules: moduleInfo
    })
  } catch (error) {
    console.error('Error in Mendix operation:', error)
    return NextResponse.json(
      { error: 'Failed to open Mendix project' },
      { status: 500 }
    )
  }
}
