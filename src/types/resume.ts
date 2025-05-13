import { z } from 'zod';

// Define Input Schema
export const ExtractResumeDataInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractResumeDataInput = z.infer<typeof ExtractResumeDataInputSchema>;

// Define Output Schema
export const ExtractResumeDataOutputSchema = z.object({
  personalDetails: z.object({
    name: z.string().describe('The name of the person.'),
    email: z.string().email().describe('The email address of the person.'),
    phone: z.string().describe('The phone number of the person.'),
    linkedin: z.string().optional().describe('The LinkedIn profile URL of the person.'),
  }).optional().describe('Personal details extracted from the resume.'),
  experience: z.array(z.object({
    title: z.string().describe('The job title.'),
    company: z.string().describe('The company name.'),
    startDate: z.string().describe('The start date of the job.'),
    endDate: z.string().optional().describe('The end date of the job, or null if still employed.'),
    description: z.string().describe('The job description.'),
  })).optional().describe('Work experience extracted from the resume.'),
  education: z.array(z.object({
    institution: z.string().describe('The name of the educational institution.'),
    degree: z.string().describe('The degree obtained.'),
    startDate: z.string().describe('The start date of the education.'),
    endDate: z.string().describe('The end date of the education.'),
    description: z.string().optional().describe('Additional details about the education.'),
  })).optional().describe('Education history extracted from the resume.'),
  skills: z.array(z.string()).optional().describe('A list of skills extracted from the resume.'),
});
export type ExtractResumeDataOutput = z.infer<typeof ExtractResumeDataOutputSchema>;


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
