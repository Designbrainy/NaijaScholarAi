import { PastQuestion, Subject, ChatMessage, PastQuestionOption } from '../types';

const PROXY_URL = '/.netlify/functions/gemini-proxy';

// Type for the streamed chunk from our Server-Sent Events (SSE) endpoint
export interface StreamChunk {
    text?: string;
    error?: string;
}

// Custom error for API calls
class ApiServiceError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiServiceError';
    }
}

async function handleApiResponse(response: Response) {
    if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { error: 'Failed to parse error response from server.' };
        }
        console.error(`API Error: ${response.status}`, errorBody);
        throw new ApiServiceError(errorBody.error || `Request failed with status ${response.status}`, response.status);
    }
    return response;
}

export const getTutorResponseStream = async (
  userMessage: string,
  systemPrompt: string,
  history: ChatMessage[],
  image?: { base64Data: string; mimeType: string }
): Promise<AsyncIterable<StreamChunk>> => {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'chat_stream',
            payload: { userMessage, systemPrompt, history, image }
        }),
    });
    
    await handleApiResponse(response);

    if (!response.body) {
        throw new ApiServiceError('Response body is null.');
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

    return {
        async *[Symbol.asyncIterator]() {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                
                // SSE format is: data: {...}\n\n
                // A single read chunk can contain multiple events
                const lines = value.split('\n\n').filter(line => line.trim().startsWith('data:'));
                for (const line of lines) {
                    const jsonStr = line.substring(6); // Remove "data: " prefix
                    try {
                        const chunk = JSON.parse(jsonStr) as StreamChunk;
                        yield chunk;
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", jsonStr, e);
                        // Optionally yield an error chunk
                        yield { error: "Failed to parse stream data." };
                    }
                }
            }
        }
    };
};

export const getExplanationForQuestion = async (question: PastQuestion, userAnswer?: string): Promise<string> => {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'explain_question',
            payload: { question, userAnswer }
        }),
    });
    
    await handleApiResponse(response);
    const data = await response.json();
    return data.text;
};

export const generateMockTestQuestions = async (subject: Subject, numberOfQuestions: number = 5): Promise<PastQuestion[]> => {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'generate_mock',
            payload: { subject, numberOfQuestions }
        }),
    });
    
    await handleApiResponse(response);
    
    const jsonStr = await response.text();
    
    let sanitizedJsonStr = jsonStr.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = sanitizedJsonStr.match(fenceRegex); 
    if (match && match[2]) {
      sanitizedJsonStr = match[2].trim();
    }
    
    let parsedData;
    try {
        parsedData = JSON.parse(sanitizedJsonStr);
    } catch (e: any) {
        console.error("Failed to parse JSON response from proxy for mock test:", e.message);
        console.error("Original string from proxy:", jsonStr);
        throw new ApiServiceError("Failed to parse mock test data from AI. The format was invalid.");
    }
    
    if (!Array.isArray(parsedData)) {
        console.error("Parsed mock test data is not an array:", parsedData);
        throw new ApiServiceError(`Expected an array for mock test questions, but received type ${typeof parsedData}.`);
    }

    const generatedData: Array<{questionText: string; options: string[]; correctOptionLetter: string; explanation: string}> = parsedData;
    
    return generatedData.map((q, index): PastQuestion => {
        const options: PastQuestionOption[] = q.options.map((optText, optIndex) => ({
            id: String.fromCharCode(97 + optIndex), // 'a', 'b', 'c', 'd'
            text: optText,
        }));
        
        const correctLetterCleaned = q.correctOptionLetter?.trim().toUpperCase();
        const correctOptionIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetterCleaned);
        
        let correctOptionId = 'a';
        if (correctOptionIndex !== -1) {
            correctOptionId = String.fromCharCode(97 + correctOptionIndex);
        } else {
            console.warn(`Invalid correctOptionLetter '${q.correctOptionLetter}' for question: '${q.questionText}'. Defaulting to 'a'.`);
        }
        
        return {
            id: `ai-gen-${subject}-${index}-${Date.now()}`,
            subject: subject,
            questionText: q.questionText,
            options: options,
            correctOptionId: correctOptionId,
            explanation: q.explanation,
        };
    });
};
