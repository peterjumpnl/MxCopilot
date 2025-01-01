export type ActionType = 
  | 'CREATE_PAGE'
  | 'UPDATE_MENU'
  | 'SET_ACCESS_RIGHTS'
  | 'EXPLAIN'
  | 'UNKNOWN'

export interface Action {
  type: ActionType
  parameters: Record<string, any>
}

export interface SmartReply {
  text: string
  actions: Action[]
  suggestedResponses?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  smartReply?: SmartReply
}
