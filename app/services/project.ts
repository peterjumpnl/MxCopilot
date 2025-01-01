import prisma from './prisma'
import { MendixApp } from './mendix-api'

export interface ProjectWithAccess extends MendixApp {
  isRecentlyAccessed?: boolean;
  lastAccessed?: Date;
}

export class ProjectService {
  async storeProjects(apps: MendixApp[]) {
    return Promise.all(
      apps.map(app => this.storeProject(app))
    )
  }

  private async storeProject(app: MendixApp) {
    return prisma.mendixProject.upsert({
      where: { id: app.Id },
      update: {
        name: app.Name,
        url: app.Url || '',
        description: app.ProjectId || null,
      },
      create: {
        id: app.Id,
        name: app.Name,
        url: app.Url || '',
        description: app.ProjectId || null,
      },
    })
  }

  async getAllProjects() {
    // Get recently accessed projects with their access times
    const accessedProjects = await prisma.accessedProject.findMany({
      orderBy: { accessedAt: 'desc' },
      take: 5, // Limit to last 5 accessed projects
    })

    // Get all projects
    const allProjects = await prisma.mendixProject.findMany({
      orderBy: { name: 'asc' },
    })

    // Create a map of accessed projects with their access times
    const accessedProjectsMap = new Map(
      accessedProjects.map(p => [p.id, { isRecentlyAccessed: true, lastAccessed: p.accessedAt }])
    )

    // Combine the lists, including access information
    return allProjects.map(project => ({
      ...project,
      ...(accessedProjectsMap.get(project.id) || { isRecentlyAccessed: false, lastAccessed: null })
    }))
  }

  async recordProjectAccess(projectId: string, projectName?: string) {
    const now = new Date()
    return prisma.accessedProject.upsert({
      where: { id: projectId },
      update: {
        accessedAt: now,
        name: projectName
      },
      create: {
        id: projectId,
        accessedAt: now,
        name: projectName,
      },
    })
  }

  async getStoredApiKeys() {
    return prisma.apiKeys.findFirst({
      where: { id: 1 }
    })
  }

  async storeApiKeys(pat: string, openaiKey: string) {
    return prisma.apiKeys.upsert({
      where: { id: 1 },
      update: {
        pat,
        openaiKey,
      },
      create: {
        id: 1,
        pat,
        openaiKey,
      },
    })
  }
}
