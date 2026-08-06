import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'OpenAI API key is missing. Please set it in your environment variables.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        amount: z.number().nullable().describe('The amount of the cheque in numeric format (e.g. 1500.00)'),
        cheque_number: z.string().nullable().describe('The cheque number, usually 6 digits found at the bottom'),
        cheque_date: z.string().nullable().describe('The date on the cheque in YYYY-MM-DD format'),
        payee_name: z.string().nullable().describe('The name of the person or business the cheque is issued to'),
        account_number: z.string().nullable().describe('The bank account number if visible'),
        bank_name: z.string().nullable().describe('The name of the bank'),
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the details from this cheque image. If a field is not clear, return null.',
            },
            {
              type: 'image',
              image: new URL(imageUrl),
            },
          ],
        },
      ],
    });

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('OCR Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process image';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
