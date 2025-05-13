import { z } from 'zod';
import type { ExtractResumeDataOutput } from '@/ai/flows/extract-resume-data';

// Re-exporting the schema and type from the AI flow for consistency
export { ExtractResumeDataOutputSchema, type ExtractResumeDataOutput } from '@/ai/flows/extract-resume-data';

// Define a default empty state matching the schema structure
export const defaultResumeData: ExtractResumeDataOutput = {
  personalDetails: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
  },
  experience: [],
  education: [],
  skills: [],
};

// Define type for individual experience item for easier usage in forms
export type Experience = z.infer<typeof ExtractResumeDataOutputSchema.shape.experience.element>;
// Define type for individual education item
export type Education = z.infer<typeof ExtractResumeDataOutputSchema.shape.education.element>;
