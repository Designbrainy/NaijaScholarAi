// netlify/functions/gemini-proxy/gemini-proxy.ts

import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import type { HandlerEvent, HandlerResponse } from "@netlify/functions";

// NOTE: This function is bundled independently. It cannot import from parent directories.
// All required data must be passed in the request payload.
const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

// In-memory cache for chat sessions. Resets on cold starts.
const chatSessionCache = new Map<string, Chat>();

const getAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set in Netlify.");
    }
    return new GoogleGenAI({ apiKey });
};

const handler = async (event: HandlerEvent): Promise<HandlerResponse | Response> => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { action, payload } = body;
        const ai = getAI();

        switch (action) {
            case 'chat_stream': {
                const { userMessage, systemPrompt, history, image } = payload;
                
                // Using a simple cache key. A more robust key could be used for complex session management.
                const sessionKey = `chat_${systemPrompt.substring(0, 50)}`;
                let chat: Chat;

                // Reset chat if history is empty (new conversation) or session doesn't exist.
                if (history.length === 0 || !chatSessionCache.has(sessionKey)) {
                     const geminiHistory = history.map((msg: any) => ({
                        role: msg.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }],
                     }));

                     chat = ai.chats.create({
                        model: GEMINI_MODEL_TEXT,
                        config: { systemInstruction: systemPrompt },
                        history: geminiHistory,
                     });
                     chatSessionCache.set(sessionKey, chat);
                } else {
                    chat = chatSessionCache.get(sessionKey)!;
                }
                
                const messageParts: Part[] = [];
                if (image) {
                    messageParts.push({ inlineData: { data: image.base64Data, mimeType: image.mimeType } });
                }
                messageParts.push({ text: userMessage });

                const stream = await chat.sendMessageStream({ message: messageParts });

                const responseStream = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of stream) {
                                const chunkText = chunk.text;
                                if (chunkText) {
                                    // SSE format: data: { "text": "..." }\n\n
                                    controller.enqueue(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
                                }
                            }
                        } catch (error) {
                             console.error("Error during stream processing:", error);
                             controller.enqueue(`data: ${JSON.stringify({ error: 'Stream processing failed.' })}\n\n`);
                        } finally {
                            controller.close();
                        }
                    },
                });

                // For streaming responses, Netlify Functions support returning a standard `Response` object.
                return new Response(responseStream, {
                    status: 200,
                    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
                });
            }

            case 'explain_question': {
                const { question, userAnswer } = payload;
                let prompt = `Explain the answer to the following WASSCE/NECO style question:
Question: "${question.questionText}"
Options:
${question.options.map((opt: any, idx: number) => `${String.fromCharCode(97 + idx)}. ${opt.text}`).join('\n')}
The correct option is: ${question.options.find((opt: any) => opt.id === question.correctOptionId)?.text}.`;

                if (userAnswer) {
                    const selectedOption = question.options.find((opt: any) => opt.id === userAnswer);
                    if (selectedOption) {
                        prompt += `\nThe student selected: "${selectedOption.text}".`;
                        if (userAnswer !== question.correctOptionId) {
                            prompt += ` Explain why this student's answer is incorrect and why the correct answer is right.`;
                        } else {
                            prompt += ` Reinforce why this student's answer is correct.`;
                        }
                    }
                } else {
                    prompt += ` Provide a detailed step-by-step explanation for solving this problem and why the correct option is the right answer.`;
                }
                prompt += "\nKeep the explanation clear, concise, and suitable for a Nigerian secondary school student. Use Naira or local Nigerian references if relevant to the question context, but only if it makes sense for the specific question (e.g. math word problems, economics).";

                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: GEMINI_MODEL_TEXT,
                    contents: prompt,
                    config: { systemInstruction: "You are an expert tutor specializing in Nigerian WASSCE/NECO exam questions. Provide clear, step-by-step explanations." }
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify({ text: response.text }),
                };
            }

            case 'generate_mock': {
                const { subject, numberOfQuestions } = payload;
                const prompt = `Generate ${numberOfQuestions} unique multiple-choice questions suitable for the Nigerian WASSCE/NECO ${subject} exam.
For each question, provide:
1. The question text.
2. Four distinct options (A, B, C, D).
3. Clearly indicate the correct option (e.g., "Correct: C").
4. A brief explanation for the correct answer.

Format the output as a JSON array of objects. Each object should have keys: "questionText", "options" (an array of strings), "correctOptionLetter" (e.g., "A", "B", "C", or "D"), and "explanation".
Ensure questions are typical of Nigerian secondary school curriculum for ${subject}.
Example for one question object:
{
  "questionText": "What is the capital of Nigeria?",
  "options": ["Lagos", "Kano", "Abuja", "Ibadan"],
  "correctOptionLetter": "C",
  "explanation": "Abuja is the federal capital territory of Nigeria."
}
`;
                const response: GenerateContentResponse = await ai.models.generateContent({
                    model: GEMINI_MODEL_TEXT,
                    contents: prompt,
                    config: {
                        systemInstruction: "You are an AI that generates high-quality exam questions for Nigerian students based on the WASSCE/NECO syllabus. Output ONLY the JSON array.",
                        responseMimeType: "application/json",
                    }
                });
                // The frontend expects to parse this JSON, so we forward the raw text which should be JSON.
                return {
                    statusCode: 200,
                    body: response.text,
                };
            }

            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
        }
    } catch (error: any) {
        console.error('Error in gemini-proxy function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};

export { handler };