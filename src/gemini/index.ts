import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

type GeminiOptions = {
    baseURL?: string
    headers?: Record<string, string>
    fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>
}

export const askGemini = async (
    question: string,
    apiKey: string,
    options?: GeminiOptions
) => {
    try {
        const model = google('gemini-2.5-flash')

        const { text } = await generateText({
            model,
            prompt: question,
            
        })

        return text
    } catch (error) {
        console.error('Gemini Error:', error)
        throw new Error('Failed to get response from Gemini')
    }
}
