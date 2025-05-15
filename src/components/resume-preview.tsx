
"use client";

import type { ExtractResumeDataOutput, Project, Certification } from '@/types/resume';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator'; // Not used for ATS style
import { User, Briefcase, GraduationCap, Wand2, Mail, Phone, LinkedinIcon, CalendarDays, Link as LinkIcon, AlignLeft, Award, Smile, BadgeCheck, Lightbulb } from 'lucide-react';
// import Image from 'next/image'; // Not used

interface ResumePreviewProps {
  data: ExtractResumeDataOutput;
}

const SectionTitle: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
  <h2 className="text-xl font-semibold text-primary mt-4 mb-2 flex items-center gap-2 border-b border-border pb-1 print:mt-3 print:mb-1 print:pb-0.5">
    <Icon className="h-5 w-5 print:h-4 print:w-4" /> {title.toUpperCase()}
  </h2>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-sm mb-0.5 print:text-xs print:mb-0">{children}</li>
);

const DetailItem: React.FC<{ label?: string; value?: string | null; href?: string; isDate?: boolean }> = ({ label, value, href, isDate }) => {
  if (!value) return null;
  const content = href ? (
    <a href={href.startsWith('http') ? href : `https://${href}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
      {value} {href && <LinkIcon className="inline h-3 w-3 ml-1" />}
    </a>
  ) : (
    value
  );
  return (
    <p className={`text-sm ${isDate ? 'text-muted-foreground text-xs uppercase' : ''} print:text-xs`}>
      {label && <span className="font-semibold">{label}: </span>}{content}
    </p>
  );
};


export function ResumePreview({ data }: ResumePreviewProps) {
  const { personalDetails, summary, experience, projects, education, skills, certifications, achievements, hobbies } = data;

  const hasContent = personalDetails?.name || personalDetails?.email || summary ||
                     (experience && experience.length > 0) ||
                     (projects && projects.length > 0) ||
                     (education && education.length > 0) ||
                     (skills && skills.length > 0) ||
                     (certifications && certifications.length > 0) ||
                     (achievements && achievements.length > 0) ||
                     (hobbies && hobbies.length > 0);

  if (!hasContent) {
    return (
      <Card className="resume-preview-card shadow-lg print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle className="text-center">Resume Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center p-10">
            Fill in the form or upload a resume to see the preview here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="resume-preview-card shadow-lg print:shadow-none print:border-none bg-white">
      <CardContent className="p-6 print:p-4 space-y-3 print:space-y-2">
        {/* Personal Details */}
        {personalDetails && (personalDetails.name || personalDetails.email || personalDetails.phone || personalDetails.linkedin) && (
          <section className="text-center mb-4 print:mb-2">
            {personalDetails.name && (
              <h1 className="text-3xl font-bold text-primary print:text-2xl">{personalDetails.name.toUpperCase()}</h1>
            )}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground print:gap-x-2 print:text-2xs">
              {personalDetails.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 print:h-2.5 print:w-2.5" /> {personalDetails.phone}
                </span>
              )}
              {personalDetails.email && (
                <a href={`mailto:${personalDetails.email}`} className="flex items-center gap-1 hover:text-accent">
                  <Mail className="h-3 w-3 print:h-2.5 print:w-2.5" /> {personalDetails.email}
                </a>
              )}
              {personalDetails.linkedin && (
                <a href={personalDetails.linkedin.startsWith('http') ? personalDetails.linkedin : `https://${personalDetails.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                  <LinkedinIcon className="h-3 w-3 print:h-2.5 print:w-2.5" /> LinkedIn
                </a>
              )}
            </div>
          </section>
        )}

        {/* Summary */}
        {summary && (
          <section>
            <SectionTitle icon={AlignLeft} title="Summary" />
            <p className="text-sm whitespace-pre-line print:text-xs">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section>
            <SectionTitle icon={Briefcase} title="Work Experience" />
            {experience.map((exp, index) => (
              <div key={index} className="mb-3 print:mb-2">
                <h3 className="text-lg font-medium print:text-base">{exp.title}</h3>
                <div className="flex justify-between items-baseline">
                  <p className="text-md font-semibold text-accent print:text-sm">{exp.company}</p>
                  <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                </div>
                {exp.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{exp.description}</p>}
              </div>
            ))}
          </section>
        )}
        
        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <SectionTitle icon={Lightbulb} title="Projects" />
            {projects.map((proj, index) => (
              <div key={index} className="mb-3 print:mb-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-medium print:text-base">
                    {proj.title}
                    {proj.link && (
                      <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">
                        <LinkIcon className="inline h-4 w-4 print:h-3 print:w-3" />
                      </a>
                    )}
                  </h3>
                  {(proj.startDate || proj.endDate) && (
                    <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                      {proj.startDate} {proj.startDate && proj.endDate && " - "} {proj.endDate}
                    </p>
                  )}
                </div>
                {proj.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{proj.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <section>
            <SectionTitle icon={GraduationCap} title="Education" />
            {education.map((edu, index) => (
              <div key={index} className="mb-3 print:mb-2">
                <h3 className="text-lg font-medium print:text-base">{edu.degree}</h3>
                 <div className="flex justify-between items-baseline">
                    <p className="text-md font-semibold text-accent print:text-sm">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                        {edu.startDate} - {edu.endDate}
                    </p>
                </div>
                {edu.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <SectionTitle icon={Wand2} title="Skills" />
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((skill, index) => (
                <ListItem key={index}>
                  {/* @ts-ignore skills from AI are direct strings, from form they are objects with value */}
                  {typeof skill === 'string' ? skill : skill.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section>
            <SectionTitle icon={BadgeCheck} title="Certifications" />
            {certifications.map((cert, index) => (
              <div key={index} className="mb-3 print:mb-2">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium print:text-base">
                        {cert.title}
                        {cert.link && (
                        <a href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">
                            <LinkIcon className="inline h-4 w-4 print:h-3 print:w-3" />
                        </a>
                        )}
                    </h3>
                    {(cert.startDate || cert.endDate) && (
                        <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                        {cert.startDate} {cert.startDate && cert.endDate && " - "} {cert.endDate}
                        </p>
                    )}
                </div>
                {cert.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{cert.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section>
            <SectionTitle icon={Award} title="Achievements" />
            <ul className="list-disc list-inside pl-1">
              {achievements.map((ach, index) => (
                <ListItem key={index}>
                  {/* @ts-ignore */}
                  {typeof ach === 'string' ? ach : ach.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}

        {/* Hobbies */}
        {hobbies && hobbies.length > 0 && (
          <section>
            <SectionTitle icon={Smile} title="Hobbies" />
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {hobbies.map((hobby, index) => (
                 <ListItem key={index}>
                  {/* @ts-ignore */}
                  {typeof hobby === 'string' ? hobby : hobby.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
