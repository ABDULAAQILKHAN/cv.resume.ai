
"use client";

import type { ExtractResumeDataOutput } from '@/types/resume';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Briefcase, GraduationCap, Wand2, Mail, Phone, LinkedinIcon, CalendarDays, MapPin, LucideReceiptRussianRuble } from 'lucide-react';
import Image from 'next/image';

interface ResumePreviewProps {
  data: ExtractResumeDataOutput;
}

type ContactInfo = {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
};

export function ResumePreview({ data }: ResumePreviewProps) {
  const { personalDetails, experience, education, skills } = data;

  if (!personalDetails && !experience?.length && !education?.length && !skills?.length) {
    return (
      <Card className="resume-preview-card shadow-lg">
        <CardHeader>
          <CardTitle>Resume Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fill in the form or upload a resume to see the preview here.</p>
        </CardContent>
      </Card>
    );
  }
  function hasAnyContactInfo(info:any): boolean {
    return !!(info.name || info.email || info.phone || info.linkedin);
  }

  if(!hasAnyContactInfo(personalDetails)) {
    return <Card className="resume-preview-card shadow-lg print:shadow-none print:border-none">
    <div className='flex flex-col justify-center'>
    <h3 className='py-3 text-center text-muted-foreground self-center'>
      You will see the preivew here once you start filling the form.
    </h3>
    </div>
  </Card>
  }
  return (
    <Card className="resume-preview-card shadow-lg print:shadow-none print:border-none">

      <CardHeader className="text-center p-6">
        {personalDetails?.name && (
          <CardTitle className="text-3xl font-bold text-primary">{personalDetails.name}</CardTitle>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
          {personalDetails?.email && (
            <a href={`mailto:${personalDetails.email}`} className="flex items-center gap-1 hover:text-accent">
              <Mail className="h-4 w-4" /> {personalDetails.email}
            </a>
          )}
          {personalDetails?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" /> {personalDetails.phone}
            </span>
          )}
          {personalDetails?.linkedin && (
            <a href={personalDetails.linkedin.startsWith('http') ? personalDetails.linkedin : `https://${personalDetails.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
              <LinkedinIcon className="h-4 w-4" /> LinkedIn
            </a>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2 border-b pb-2">
              <Briefcase className="h-5 w-5" /> Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <h3 className="text-lg font-medium">{exp.title}</h3>
                  <p className="text-md font-semibold text-accent">{exp.company}</p>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                  {exp.description && <p className="mt-1 text-sm whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2 border-b pb-2">
              <GraduationCap className="h-5 w-5" /> Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <h3 className="text-lg font-medium">{edu.degree}</h3>
                  <p className="text-md font-semibold text-accent">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                     <CalendarDays className="h-3 w-3" /> {edu.startDate} - {edu.endDate}
                  </p>
                  {edu.description && <p className="mt-1 text-sm whitespace-pre-line">{edu.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2 border-b pb-2">
              <Wand2 className="h-5 w-5" /> Skills
            </h2>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <li key={index} className="bg-accent/20 text-accent-foreground py-1 px-3 rounded-full text-sm">
                  {/* @ts-ignore skills from AI are direct strings, from form they are objects with value */}
                  {typeof skill === 'string' ? skill : skill.value}
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
