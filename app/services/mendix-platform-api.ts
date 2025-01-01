import { MendixPlatformClient } from 'mendixplatformsdk'

export class MendixPlatformService {
  private client: MendixPlatformClient | null = null

  async initialize(pat: string) {
    this.client = new MendixPlatformClient(pat)
  }

  async getProjectDetails(projectId: string) {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.')
    }

    try {
      const project = await this.client.getProject(projectId)
      return {
        id: projectId,
        name: project.name,
        url: project.url || '',
        description: project.projectId || null,
      }
    } catch (error) {
      console.error('Error fetching project from Mendix Platform:', error)
      throw error
    }
  }
}
