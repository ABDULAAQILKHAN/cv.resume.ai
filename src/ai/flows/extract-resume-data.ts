
'use server';
/**
 * @fileOverview AI flow to extract data from a resume.
 *
 * - extractResumeData - A function that handles the resume data extraction process.
 */

import {ai} from '@/ai/genkit';
// Import both the LLM's direct output schema and the final application schema
import type { ExtractResumeDataInput, ExtractResumeDataOutput, LLMResumeDataOutput } from '@/types/resume';
import { ExtractResumeDataInputSchema, ExtractResumeDataOutputSchema, LLMResumeDataOutputSchema } from '@/types/resume';


// Export only the async function which returns the final, transformed data structure
export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  return extractResumeDataFlow(input);
}

// This prompt definition tells the LLM to output a simpler structure,
// especially for skills, achievements, and hobbies (as arrays of strings).
const extractResumeDataPrompt = ai.definePrompt({
  name: 'extractResumeDataPrompt',
  input: {schema: ExtractResumeDataInputSchema},
  output: {schema: LLMResumeDataOutputSchema}, // LLM is expected to return this schema
  prompt: `You are an expert resume parser. Extract the following information from the resume. Prioritize extracting as much information as possible based on the defined output schema. If a field is not present in the resume, omit it or provide a suitable empty/default value as per the schema (e.g., empty array for lists, empty string for optional text).

For 'skills', 'achievements', and 'hobbies', please provide these as simple lists of strings. For other fields like experience, education, projects, and certifications, follow the structured object format defined.

Resume: {{media url=resumeDataUri}}`,
});

// This flow defines its output as ExtractResumeDataOutputSchema,
// meaning it will perform the transformation from the LLM's output.
const extractResumeDataFlow = ai.defineFlow(
  {
    name: 'extractResumeDataFlow',
    inputSchema: ExtractResumeDataInputSchema,
    outputSchema: ExtractResumeDataOutputSchema, // The flow returns the fully transformed data
  },
  async input => {
    // Get the raw output from the LLM, which conforms to LLMResumeDataOutputSchema
    const {output: llmOutput} = await extractResumeDataPrompt(input);

    // Parse the LLM's output using the final application schema (ExtractResumeDataOutputSchema).
    // This step applies the Zod transformations (e.g., converting string[] for skills
    // into {value: string}[]).
    // If llmOutput is null or undefined (e.g., due to a prompt error or empty response),
    // provide an empty object to .parse() to ensure default values from the schema are applied.
    const transformedOutput = ExtractResumeDataOutputSchema.parse(llmOutput || {});
    
    return transformedOutput;
  }
);
