import { Action, ActionType, SmartReply } from '../types/chat'
import OpenAI from 'openai'

const INTENT_SYSTEM_PROMPT = `You are an AI assistant specialized in Mendix development. Analyze user requests and:
1. Identify the primary intent
2. Extract relevant parameters
3. Suggest follow-up responses

Output should be valid JSON in this format:
{
  "intent": "CREATE_PAGE" | "UPDATE_MENU" | "SET_ACCESS_RIGHTS" | "EXPLAIN" | "UNKNOWN",
  "parameters": {
    // Extracted parameters specific to the intent
  },
  "suggestedResponses": [
    // 2-3 relevant follow-up questions or actions
  ]
}

Example intents and their parameters:
1. CREATE_PAGE: { pageName, layout, widgets[] }
2. UPDATE_MENU: { menuItems[], location }
3. SET_ACCESS_RIGHTS: { module, userRole, permissions[] }
4. EXPLAIN: { topic, context }
5. UNKNOWN: { topic }

Keep responses focused and specific to Mendix development.`

export async function analyzeIntent(
  openai: OpenAI,
  message: string
): Promise<SmartReply> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: INTENT_SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0].message.content)
    
    return {
      text: '', // This will be filled by the main chat response
      actions: [{
        type: response.intent as ActionType,
        parameters: response.parameters
      }],
      suggestedResponses: response.suggestedResponses
    }
  } catch (error) {
    console.error('Error analyzing intent:', error)
    return {
      text: '',
      actions: [{
        type: 'UNKNOWN',
        parameters: {}
      }],
      suggestedResponses: []
    }
  }
}

export async function executeActions(actions: Action[]): Promise<void> {
  for (const action of actions) {
    switch (action.type) {
      case 'CREATE_PAGE':
        await handleCreatePage(action.parameters)
        break
      case 'UPDATE_MENU':
        await handleUpdateMenu(action.parameters)
        break
      case 'SET_ACCESS_RIGHTS':
        await handleSetAccessRights(action.parameters)
        break
      // Add more action handlers as needed
    }
  }
}

// Action handlers (to be implemented based on your Mendix API integration)
async function handleCreatePage(params: Record<string, any>) {
  // TODO: Implement page creation using Mendix SDK
  console.log('Creating page with params:', params)
}

async function handleUpdateMenu(params: Record<string, any>) {
  // TODO: Implement menu updates using Mendix SDK
  console.log('Updating menu with params:', params)
}

async function handleSetAccessRights(params: Record<string, any>) {
  // TODO: Implement access rights changes using Mendix SDK
  console.log('Setting access rights with params:', params)
}
