import { NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai'
import prisma from '@/app/lib/prisma'
import { IntentService } from '@/app/services/intentService'

const intentService = new IntentService()

export async function POST(request: Request) {
  try {
    const { message, model, projectId } = await request.json()

    // Get API key
    const apiKeys = await prisma.apiKeys.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!apiKeys?.openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not found' },
        { status: 401 }
      )
    }

    // Get project context
    const project = await prisma.mendixProject.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Analyze intent and get smart replies
    const smartReply = await intentService.analyzeIntent(message, project)

    // Configure OpenAI
    const configuration = new Configuration({
      apiKey: apiKeys.openaiKey,
    })
    const openai = new OpenAIApi(configuration)

    // Include project context in the conversation
    const systemMessage = `You are an AI assistant helping with the Mendix project "${project.name}". 
    Project ID: ${project.id}
    Project Description: ${project.description || 'No description available'}
    
    Provide assistance with development tasks, answer questions, and suggest solutions.`

    const completion = await openai.createChatCompletion({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ],
    })

    const response = completion.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Record the interaction
    await prisma.chatMessage.create({
      data: {
        projectId,
        userMessage: message,
        assistantResponse: response,
        model,
        intent: smartReply.actions[0]?.type || 'UNKNOWN'
      }
    })

    return NextResponse.json({
      response,
      smartReply
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
