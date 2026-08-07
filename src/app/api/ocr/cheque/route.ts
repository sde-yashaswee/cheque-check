import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Schema for extracting cheque details.
 * Defined using Zod for type safety and validation.
 */
const ChequeDetailsSchema = z.object({
  amount: z.number().nullable().describe('The cheque amount as a number (e.g., 1500.00).'),
  cheque_number: z.string().nullable().describe('Strictly 6 contiguous digits found at the bottom lower left between narrow straight lines. Do not confuse with account number.'),
  cheque_date: z.string().nullable().describe('Date from the top-right boxes (originally DDMMYYYY). Convert and return strictly in YYYY-MM-DD format.'),
  payee_name: z.string().nullable().describe('The name of the payee (after "Pay" or "To").'),
  account_number: z.string().nullable().describe('The bank account number. Found near a block reading "A/c no". Avoid interpreting labels as numbers.'),
  account_name: z.string().nullable().describe('The name of the account holder, found below the signature line (bottom right). Can be multiple lines.'),
  ifsc_code: z.string().nullable().describe('The IFSC code (4 alphabets + 7 digits), located at top middle left of the date.'),
  bank_name: z.string().nullable().describe('The name of the bank.'),
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
 * Uses GPT-4o for high-accuracy vision processing and document extraction.
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
              text: `Analyze this cheque image and extract all relevant details. Adhere strictly to these rules:
- Date: Located in the top right corner. The block letters/boxes contain the date in DDMMYYYY format. Extract and format as YYYY-MM-DD.
- Cheque Number: Located at the bottom lower left. It is between two narrow straight lines (like |123456| or "123456"). Extract ONLY these 6 contiguous digits. Do NOT confuse this with the account number.
- Account Number: Located near a block that reads "A/c no" or "Account Number". Do not interpret the black box text/labels as the account number. Usually a long numerical sequence.
- Account Name: Found below the signature area (bottom right). It could be multiple lines or a single line. Extract this exactly as written. This is NOT the payee name.
- Payee Name: The name written after "Pay" or "To".
- IFSC Code: Located at the top middle of the cheque, to the left of the date. Format is 4 alphabetic characters followed by 7 numeric digits (e.g., HDFC0001234). If not visible/unclear, return null.
- If any field is not clearly visible or legible, return null for that field. Keep processing fast and concise.`,
            },
            {
              type: 'image',
              image: imageUrl,
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
      const cookieStore = await cookies();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createServerClient(supabaseUrl, supabaseKey, { cookies: { get: (name) => cookieStore.get(name)?.value } });
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return this.respondWithError('Unauthorized', 401);
      }

      // Check Quota
      const { data: quota, error: quotaError } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', user.id)
        .eq('feature_id', 'ai_scan')
        .single();

      if (quotaError || !quota) {
        return this.respondWithError('No AI scan quota found. Please subscribe to use this feature.', 402);
      }

      if (quota.used >= quota.limit) {
        return this.respondWithError('AI scan quota exhausted. Please top-up to continue.', 402);
      }

      const body = await req.json();
      const { imageUrl } = body;

      if (!imageUrl) {
        return this.respondWithError('Image URL is required for processing.', 400);
      }

      logger.info(`[OcrController] Processing request for user ${user.id} for image: ${imageUrl}`, { imageUrl });
      
      const result = await this.ocrProvider.processImage(imageUrl);

      // Increment usage
      await supabase
        .from('user_quotas')
        .update({ used: quota.used + 1 })
        .eq('id', quota.id);

      return this.respondWithSuccess(result);
    } catch (error: any) {
      logger.error('[OcrController Error]', error);

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
