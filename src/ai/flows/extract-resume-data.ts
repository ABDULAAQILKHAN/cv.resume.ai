'use server';
/**
 * @fileOverview AI flow to extract data from a resume.
 *
 * - extractResumeData - A function that handles the resume data extraction process.
 */

import {ai} from '@/ai/genkit';
// Import schemas and types from src/types/resume.ts
import type { ExtractResumeDataInput, ExtractResumeDataOutput } from '@/types/resume';
import { ExtractResumeDataInputSchema, ExtractResumeDataOutputSchema } from '@/types/resume';


// Export only the async function
export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  return extractResumeDataFlow(input);
}

const extractResumeDataPrompt = ai.definePrompt({
  name: 'extractResumeDataPrompt',
  input: {schema: ExtractResumeDataInputSchema}, // Use imported schema
  output: {schema: ExtractResumeDataOutputSchema}, // Use imported schema
  prompt: `You are an expert resume parser. Extract the following information from the resume. If a field can't be found, omit it from the output, but prioritize extracting as much information as possible.

Resume: {{media url=resumeDataUri}}`,
});

const extractResumeDataFlow = ai.defineFlow(
  {
    name: 'extractResumeDataFlow',
    inputSchema: ExtractResumeDataInputSchema, // Use imported schema
    outputSchema: ExtractResumeDataOutputSchema, // Use imported schema
  },
  async input => {
    const {output} = await extractResumeDataPrompt(input);
    console.log("ai output",output)
    // Ensure output conforms to schema, especially for optional fields that might be undefined
    // Zod `parse` will add default values for optional fields if they are not present, 
    // but LLM might return null explicitly.
    // For simple pass-through, output! is fine if schema matches exactly what LLM provides.
    // If stricter defaulting is needed, one might do:
    // return ExtractResumeDataOutputSchema.parse(output || {});
    return output!;
  }
);
