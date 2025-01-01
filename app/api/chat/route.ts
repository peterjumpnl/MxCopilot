import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import prisma from '@/app/lib/prisma'
import { analyzeIntent, executeActions } from '@/app/services/intentService'

export async function POST(request: Request) {
  try {
    // Get OpenAI key from database
    const apiKeys = await prisma.apiKeys.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!apiKeys?.openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not found in database' },
        { status: 401 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKeys.openaiKey,
    })

    const { message, model } = await request.json()

    // First, analyze the intent
    const smartReply = await analyzeIntent(openai, message)

    // Then, get the main response
    const completion = await openai.chat.completions.create({
      model: model || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant specialized in Mendix development. Help users understand their Mendix projects and provide guidance on best practices. Keep responses focused on the specific question."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    // Combine the intent analysis with the main response
    smartReply.text = completion.choices[0].message.content

    // Execute any actions if needed
    await executeActions(smartReply.actions)

    return NextResponse.json({ 
      response: smartReply.text,
      smartReply 
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get response from OpenAI' }, 
      { status: 500 }
    )
  }
}
