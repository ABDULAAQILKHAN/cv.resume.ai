
"use client";

import * as React from 'react';
import type { ExtractResumeDataOutput, Project, Certification, Skill, Achievement, Hobby, Language, VolunteerEntry, Publication, Education, Experience } from '@/types/resume';
import { Card, CardContent } from '@/components/ui/card';
import { User, Briefcase, GraduationCap, Wand2, Mail, Phone, LinkedinIcon, Link as LinkIcon, AlignLeft, Award, Smile, BadgeCheck, Lightbulb, Languages as LanguagesIcon, Users, FileText as PublicationIcon, MapPin } from 'lucide-react';
import { isValidUrl } from '@/lib/utils';

interface ResumePreviewProps {
  data: ExtractResumeDataOutput;
}

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; className?: string }> = ({ icon: Icon, title, className = "" }) => (
  <h2 className={`text-xl font-semibold text-primary mt-4 mb-2 flex items-center gap-2 border-b border-border pb-1 print:mt-3 print:mb-1 print:pb-0.5 ${className}`}>
    <Icon className="h-5 w-5 print:h-4 print:w-4 flex-shrink-0" />
    <span className="flex-grow">{title.toUpperCase()}</span>
  </h2>
);

const ListItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <li className={`text-sm mb-0.5 print:text-xs print:mb-0 ${className}`}>{children}</li>
);


// Changed: Removed React.forwardRef and ref parameter
export function ResumePreview({ data }: ResumePreviewProps) {
  const { 
    personalDetails, 
    summary, 
    experience, 
    projects, 
    education, 
    skills, 
    certifications, 
    achievements, 
    hobbies,
    languages,
    volunteerExperience,
    publications 
  } = data;

  const hasContent = personalDetails?.name || personalDetails?.email || summary ||
                     (experience && experience.length > 0) ||
                     (projects && projects.length > 0) ||
                     (education && education.length > 0) ||
                     (skills && skills.length > 0) ||
                     (certifications && certifications.length > 0) ||
                     (achievements && achievements.length > 0) ||
                     (hobbies && hobbies.length > 0) ||
                     (languages && languages.length > 0) ||
                     (volunteerExperience && volunteerExperience.length > 0) ||
                     (publications && publications.length > 0);

  if (!hasContent) {
    return (
      // Changed: Removed ref from Card
      <Card className="resume-preview-card shadow-lg print:shadow-none print:border-none">
        <CardContent className="p-6 print:p-4">
          <p className="text-muted-foreground text-center p-10">
            Fill in the form or upload a resume to see the preview here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    // Changed: Removed ref from Card, id 'resume-content-for-pdf' can be kept if useful for other things or removed
    <Card id='resume-content-for-pdf' className="resume-preview-card shadow-lg print:shadow-none print:border-none bg-white text-black">
      <CardContent className="p-6 print:p-4 space-y-3 print:space-y-2">
        {/* Personal Details */}
        {personalDetails && (personalDetails.name || personalDetails.email || personalDetails.phone || personalDetails.linkedin || personalDetails.portfolioGithubUrl || personalDetails.location || personalDetails.professionalTitle) && (
          <section className="text-center mb-4 print:mb-2 break-inside-avoid">
            {personalDetails.name && (
              <h1 className="text-3xl font-bold text-primary print:text-2xl">{personalDetails.name.toUpperCase()}</h1>
            )}
            {personalDetails.professionalTitle && (
              <p className="text-lg text-accent print:text-base -mt-1">{personalDetails.professionalTitle}</p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground print:gap-x-2 print:text-2xs">
              {personalDetails.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 print:h-2.5 print:w-2.5" /> {personalDetails.location}
                </span>
              )}
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
              {personalDetails.linkedin && isValidUrl(personalDetails.linkedin) && (
                <a href={personalDetails.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                  <LinkedinIcon className="h-3 w-3 print:h-2.5 print:w-2.5" /> LinkedIn
                </a>
              )}
              {personalDetails.portfolioGithubUrl && isValidUrl(personalDetails.portfolioGithubUrl) && (
                <a href={personalDetails.portfolioGithubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                  <LinkIcon className="h-3 w-3 print:h-2.5 print:w-2.5" /> Portfolio/GitHub
                </a>
              )}
            </div>
          </section>
        )}

        {/* Summary */}
        {summary && (
          <section className="break-inside-avoid">
            <SectionTitle icon={AlignLeft} title="Summary" />
            <p className="text-sm whitespace-pre-line print:text-xs">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {experience && experience.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Briefcase} title="Work Experience" />
            {experience.map((exp: Experience, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                <h3 className="text-lg font-medium print:text-base">{exp.title}</h3>
                <div className="flex justify-between items-baseline">
                  <p className="text-md font-semibold text-accent print:text-sm">{exp.company}</p>
                  <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                    {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                  </p>
                </div>
                 {exp.location && <p className="text-xs text-muted-foreground print:text-2xs italic">{exp.location}</p>}
                {exp.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{exp.description}</p>}
              </div>
            ))}
          </section>
        )}
        
        {/* Projects */}
        {projects && projects.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Lightbulb} title="Projects" />
            {projects.map((proj: Project, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-medium print:text-base">
                    {proj.title}
                    {proj.link && isValidUrl(proj.link) && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">
                        <LinkIcon className="inline h-4 w-4 print:h-3 print:w-3 align-middle" />
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
          <section className="break-inside-avoid">
            <SectionTitle icon={GraduationCap} title="Education" />
            {education.map((edu: Education, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                 <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium print:text-base">{edu.degree}</h3>
                    <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                        {edu.graduationYear || `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' - ' : ''}${edu.endDate || ''}`}
                    </p>
                </div>
                <p className="text-md font-semibold text-accent print:text-sm">{edu.institution}</p>
                {edu.location && <p className="text-xs text-muted-foreground print:text-2xs italic">{edu.location}</p>}
                {edu.gpa && <p className="text-xs text-muted-foreground print:text-2xs">GPA: {edu.gpa}</p>}
                {edu.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Wand2} title="Skills" />
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((skill: Skill, index: number) => (
                <ListItem key={index}>
                  {skill.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={BadgeCheck} title="Certifications" />
            {certifications.map((cert: Certification, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-medium print:text-base">
                        {cert.title}
                        {cert.link && isValidUrl(cert.link) && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">
                            <LinkIcon className="inline h-4 w-4 print:h-3 print:w-3 align-middle" />
                        </a>
                        )}
                    </h3>
                    {(cert.issueDate) && ( 
                        <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                           Issued: {cert.issueDate} {cert.expiryDate && `| Expires: ${cert.expiryDate}`}
                        </p>
                    )}
                </div>
                 {cert.issuingOrganization && <p className="text-sm text-muted-foreground print:text-xs italic">By: {cert.issuingOrganization}</p>}
                {cert.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{cert.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={LanguagesIcon} title="Languages" />
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {languages.map((lang: Language, index: number) => (
                <ListItem key={index}>
                  <strong>{lang.language}:</strong> {lang.proficiency}
                </ListItem>
              ))}
            </ul>
          </section>
        )}
        
        {/* Volunteer Experience */}
        {volunteerExperience && volunteerExperience.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Users} title="Volunteer Experience" />
            {volunteerExperience.map((vol: VolunteerEntry, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                <h3 className="text-lg font-medium print:text-base">{vol.role || vol.title}</h3>
                <div className="flex justify-between items-baseline">
                  <p className="text-md font-semibold text-accent print:text-sm">{vol.organization}</p>
                  <p className="text-xs text-muted-foreground uppercase print:text-2xs">
                    {vol.startDate} {vol.endDate && `- ${vol.endDate}`}
                  </p>
                </div>
                {vol.location && <p className="text-xs text-muted-foreground print:text-2xs italic">{vol.location}</p>}
                {vol.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{vol.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* Publications */}
        {publications && publications.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={PublicationIcon} title="Publications" />
            {publications.map((pub: Publication, index: number) => (
              <div key={index} className="mb-3 print:mb-2 break-inside-avoid">
                <h3 className="text-lg font-medium print:text-base">
                  {pub.title}
                  {pub.link && isValidUrl(pub.link) && (
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-accent hover:underline">
                      <LinkIcon className="inline h-4 w-4 print:h-3 print:w-3 align-middle" />
                    </a>
                  )}
                </h3>
                {pub.authors && <p className="text-sm text-muted-foreground print:text-xs italic">Authors: {pub.authors.join(", ")}</p>}
                {pub.journalOrConference && <p className="text-sm font-semibold text-accent print:text-xs">{pub.journalOrConference}</p>}
                {pub.date && <p className="text-xs text-muted-foreground uppercase print:text-2xs">Date: {pub.date}</p>}
                {pub.description && <p className="mt-1 text-sm whitespace-pre-line print:text-xs">{pub.description}</p>}
              </div>
            ))}
          </section>
        )}


        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Award} title="Achievements" />
            <ul className="list-disc list-inside pl-1">
              {achievements.map((ach: Achievement, index: number) => (
                <ListItem key={index}>
                  {ach.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}

        {/* Hobbies */}
        {hobbies && hobbies.length > 0 && (
          <section className="break-inside-avoid">
            <SectionTitle icon={Smile} title="Hobbies" />
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {hobbies.map((hobby: Hobby, index: number) => (
                 <ListItem key={index}>
                  {hobby.value}
                </ListItem>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

// Changed: Removed display name as it's not a forwardRef anymore
// ResumePreview.displayName = "ResumePreview";
// export { ResumePreview }; // This export style is fine for a regular function component
