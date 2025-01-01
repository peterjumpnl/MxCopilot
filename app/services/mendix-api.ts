export interface MendixApp {
  Id: string;
  Name: string;
  ProjectId: string;
  Url: string;
}

export interface MendixApiResponse {
  apps: MendixApp[];
}

const MENDIX_API_URL = 'https://cloud.home.mendix.com/api/v4/apps'

export class MendixApiService {
  constructor(private readonly pat: string) {}

  async getApps(): Promise<MendixApp[]> {
    const response = await fetch(MENDIX_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `MxToken ${this.pat}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Mendix API error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const data = await response.json()

    if (!data.apps || !Array.isArray(data.apps)) {
      throw new Error('Invalid response from Mendix API')
    }

    return data.apps
  }
}
