
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

// Define sub-schemas for complex array types
const CertificationSchema = z.object({
  title: z.string().describe('The title of the certification.'),
  link: z.string().optional().describe('A URL link related to the certification (e.g., credential).'),
  startDate: z.string().optional().describe('The start date or issue date of the certification.'),
  endDate: z.string().optional().describe('The expiry date of the certification (if applicable).'),
  description: z.string().optional().describe('A brief description of the certification.'),
});
export type Certification = z.infer<typeof CertificationSchema>;

const ProjectSchema = z.object({
  title: z.string().describe('The title of the project.'),
  link: z.string().optional().describe('A URL link to the project (e.g., GitHub, live demo).'),
  startDate: z.string().optional().describe('The start date of the project.'),
  endDate: z.string().optional().describe('The end date of the project.'),
  description: z.string().describe('A description of the project, including technologies used and your role.'),
});
export type Project = z.infer<typeof ProjectSchema>;


// Define Output Schema
export const ExtractResumeDataOutputSchema = z.object({
  personalDetails: z.object({
    name: z.string().describe('The name of the person.'),
    email: z.string().describe('The email address of the person.'),
    phone: z.string().describe('The phone number of the person.'),
    linkedin: z.string().optional().describe('The LinkedIn profile URL of the person.'),
  }).optional().describe('Personal details extracted from the resume.'),
  summary: z.string().optional().describe('A brief professional summary or objective statement from the resume.'),
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
  projects: z.array(ProjectSchema).optional().describe('A list of personal or professional projects.'),
  certifications: z.array(CertificationSchema).optional().describe('A list of certifications and licenses.'),
  achievements: z.array(z.string()).optional().describe('A list of key achievements or accomplishments.'),
  hobbies: z.array(z.string()).optional().describe('A list of hobbies or interests (if mentioned).'),
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
  summary: '',
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  hobbies: [],
};

// Define type for individual experience item for easier usage in forms
export type Experience = z.infer<typeof ExtractResumeDataOutputSchema.shape.experience.element>;
// Define type for individual education item
export type Education = z.infer<typeof ExtractResumeDataOutputSchema.shape.education.element>;
// Projects and Certifications types are already exported above
