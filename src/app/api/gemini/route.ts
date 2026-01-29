import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { question } = await request.json()

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            )
        }

        const model = google('gemini-2.5-flash')

        const { text } = await generateText({
            model,
            prompt: question,
        })

        return NextResponse.json({ text })
    } catch (error) {
        console.error('Gemini API Error:', error)
        return NextResponse.json(
            { error: 'Failed to get response from Gemini' },
            { status: 500 }
        )
    }
}
