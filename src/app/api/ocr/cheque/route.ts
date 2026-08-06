import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Schema for extracting cheque details.
 * Defined using Zod for type safety and validation.
 */
const ChequeDetailsSchema = z.object({
  amount: z.number().nullable().describe('The amount of the cheque in numeric format (e.g. 1500.00)'),
  cheque_number: z.string().nullable().describe('The cheque number, usually 6 digits found at the bottom'),
  cheque_date: z.string().nullable().describe('The date on the cheque in YYYY-MM-DD format'),
  payee_name: z.string().nullable().describe('The name of the person or business the cheque is issued to'),
  account_number: z.string().nullable().describe('The bank account number if visible'),
  bank_name: z.string().nullable().describe('The name of the bank'),
});

type ChequeDetails = z.infer<typeof ChequeDetailsSchema>;

/**
 * Interface for OCR Service Providers.
 * Allows for easy swapping of AI models or OCR engines in the future.
 */
interface IOcrProvider {
  processImage(imageUrl: string): Promise<ChequeDetails>;
}

/**
 * OpenAI Implementation of the OCR Provider.
 * Uses GPT-4o-mini for efficient and accurate vision processing.
 */
class OpenAiOcrProvider implements IOcrProvider {
  private readonly modelName: string;

  constructor(modelName: string = 'gpt-4o-mini') {
    this.modelName = modelName;
  }

  async processImage(imageUrl: string): Promise<ChequeDetails> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('System configuration error: AI service credentials missing.');
    }

    const { object } = await generateObject({
      model: openai(this.modelName),
      schema: ChequeDetailsSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this cheque image and extract all relevant details. If a field is not clearly visible or legible, return null for that field.',
            },
            {
              type: 'image',
              image: new URL(imageUrl),
            },
          ],
        },
      ],
    });

    return object;
  }
}

/**
 * Controller for handling OCR requests.
 * Manages the flow of data, error handling, and response formatting.
 */
class OcrController {
  constructor(private ocrProvider: IOcrProvider) {}

  async handleRequest(req: Request): Promise<Response> {
    try {
      const body = await req.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return this.respondWithError('Image URL is required for processing.', 400);
      }

      console.log(`[OcrController] Processing request for image: ${imageUrl}`);
      
      const result = await this.ocrProvider.processImage(imageUrl);

      return this.respondWithSuccess(result);
    } catch (error: any) {
      console.error('[OcrController Error]:', error);

      const status = error.message?.includes('credentials') ? 500 : 400;
      const message = error instanceof Error ? error.message : 'An unexpected error occurred during image processing.';

      return this.respondWithError(message, status);
    }
  }

  private respondWithSuccess(data: any): Response {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private respondWithError(message: string, status: number): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// --- Route Initialization ---

// Dependency Injection: Initialize the provider and controller.
const ocrProvider = new OpenAiOcrProvider();
const ocrController = new OcrController(ocrProvider);

/**
 * Main POST route handler for the Cheque OCR API.
 */
export async function POST(req: Request) {
  return ocrController.handleRequest(req);
}
