
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import jsPDF from 'jspdf';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput, Skill, Achievement, Hobby, Experience, Education, Project, Certification, Language, VolunteerEntry, Publication } from '@/types/resume';
import { ExtractResumeDataOutputSchema, defaultResumeData } from '@/types/resume';
import { ResumeForm } from '@/components/resume-form';
import { FileUpload } from '@/components/file-upload';
import { ResumePreview } from '@/components/resume-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, FileText } from 'lucide-react';
import { useResumeContext } from '@/context/resume-context';
import { isValidUrl } from '@/lib/utils';


const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ResumeBuilderPage() {
  const [isLoadingAI, setIsLoadingAI] = React.useState(false);
  const [isPreparingPrint, setIsPreparingPrint] = React.useState(false);
  const { toast } = useToast();
  const { dispatch } = useResumeContext();

  const form = useForm<ExtractResumeDataOutput>({
    resolver: zodResolver(ExtractResumeDataOutputSchema),
    defaultValues: defaultResumeData,
    mode: 'onBlur', 
  });

  const watchedData = form.watch();

  const handleFileUpload = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const resumeDataUri = await fileToDataUri(file);
      const extractedDataFromAI = await extractResumeData({ resumeDataUri });
      
      const validationResult = ExtractResumeDataOutputSchema.safeParse(extractedDataFromAI || {});
      
      if (!validationResult.success) {
        console.error("Validation failed for AI extracted data:", validationResult.error.flatten());
        toast({
          title: "Data Parsing Error",
          description: "There was an issue processing some fields from the extracted resume data. Please review the form or try again.",
          variant: "destructive",
          duration: 7000,
        });
        form.reset(extractedDataFromAI && typeof extractedDataFromAI === 'object' ? extractedDataFromAI : defaultResumeData);
        if (extractedDataFromAI && typeof extractedDataFromAI === 'object') {
            dispatch({ type: 'SET_RESUME_DATA', payload: extractedDataFromAI as ExtractResumeDataOutput });
        } else {
            dispatch({ type: 'SET_RESUME_DATA', payload: defaultResumeData });
        }
      } else {
        form.reset(validationResult.data);
        dispatch({ type: 'SET_RESUME_DATA', payload: validationResult.data }); 
        toast({
          title: "Success!",
          description: "Resume data extracted and pre-filled.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error("Error extracting resume data:", error);
      let errorMessage = "Failed to extract data from resume. Please try again or fill manually.";
      if (error instanceof Error) {
        errorMessage += ` Details: ${error.message}`;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
      form.reset(defaultResumeData); 
      dispatch({ type: 'SET_RESUME_DATA', payload: defaultResumeData }); 
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleFormSave = (values: ExtractResumeDataOutput) => {
    dispatch({ type: 'SET_RESUME_DATA', payload: values });
    console.log("Form data validated/updated:", values);
    toast({
        title: "Resume Updated",
        description: "Your resume data has been updated in the form and preview.",
    });
  };

  const handlePrepareAndPrint = async () => {
    setIsPreparingPrint(true);
    try {
      const isValid = await form.trigger(); 

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors highlighted in the form before generating the PDF.",
          variant: "destructive",
        });
        setIsPreparingPrint(false);
        return;
      }

      const currentData = form.getValues();
      const validationResult = ExtractResumeDataOutputSchema.safeParse(currentData);

      if (!validationResult.success) {
        console.error("Final validation failed before PDF generation:", validationResult.error.flatten());
        toast({
          title: "Data Incomplete or Invalid",
          description: "Please ensure all required fields are filled correctly before generating the PDF.",
          variant: "destructive",
        });
        setIsPreparingPrint(false);
        return;
      }
      
      const resumeData = validationResult.data;
      dispatch({ type: 'SET_RESUME_DATA', payload: resumeData });
      
      const doc = new jsPDF('p', 'pt', 'letter');
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - 2 * margin;
      let currentY = margin;
      const lineHeightMultiplier = 1.4;
      const sectionSpacing = 15;
      const itemSpacing = 5;

      const checkAndAddPage = () => {
        if (currentY > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
      };

      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, options: { fontStyle?: string, fontSize?: number, color?: string, isLink?: boolean, url?: string } = {}) => {
        if (!text) return;
        const { fontStyle = 'normal', fontSize = 10, color = '#000000' } = options;
        doc.setFont('helvetica', fontStyle);
        doc.setFontSize(fontSize);
        doc.setTextColor(color);

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          checkAndAddPage();
          if (options.isLink && options.url) {
            doc.textWithLink(line, x, currentY, { url: options.url });
          } else {
            doc.text(line, x, currentY);
          }
          if (index < lines.length -1) currentY += fontSize * lineHeightMultiplier;
        });
        currentY += fontSize * lineHeightMultiplier; // Add space after the block
      };
      
      const addSectionTitle = (title: string) => {
        checkAndAddPage();
        currentY += sectionSpacing / 2; // Extra space before title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor('#2c3e50'); // Primary color
        doc.text(title.toUpperCase(), margin, currentY);
        currentY += 14 * lineHeightMultiplier;
        doc.setDrawColor('#ecf0f1'); // Light gray for line
        doc.line(margin, currentY - (14 * lineHeightMultiplier / 2) + 2, pageWidth - margin, currentY - (14 * lineHeightMultiplier / 2) + 2);
        currentY += itemSpacing;
      };


      // Personal Details
      if (resumeData.personalDetails) {
        const { name, email, phone, linkedin, portfolioGithubUrl, professionalTitle, location } = resumeData.personalDetails;
        if (name) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(24);
          doc.setTextColor('#2c3e50');
          const nameWidth = doc.getTextWidth(name.toUpperCase());
          doc.text(name.toUpperCase(), (pageWidth - nameWidth) / 2, currentY);
          currentY += 24 * lineHeightMultiplier * 0.8;
        }
        if (professionalTitle) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.setTextColor('#3498db'); // Accent color
          const titleWidth = doc.getTextWidth(professionalTitle);
          doc.text(professionalTitle, (pageWidth - titleWidth) / 2, currentY);
          currentY += 12 * lineHeightMultiplier;
        }
        
        let contactLine = '';
        if (location) contactLine += `${location} | `;
        if (phone) contactLine += `P: ${phone} | `;
        if (email) contactLine += `E: ${email}`;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor('#555555');
        const contactWidth = doc.getTextWidth(contactLine);
        doc.text(contactLine, (pageWidth - contactWidth) / 2, currentY);
        currentY += 9 * lineHeightMultiplier;

        let linkLine = '';
        if (linkedin && isValidUrl(linkedin)) linkLine += `LinkedIn: ${linkedin}`;
        if (portfolioGithubUrl && isValidUrl(portfolioGithubUrl)) {
            if (linkLine) linkLine += ' | ';
            linkLine += `GitHub: ${portfolioGithubUrl}`;
        }
        if(linkLine){
            const linkLineY = currentY;
            doc.setFontSize(9);
            const textParts = [];
            let currentX = (pageWidth - doc.getTextWidth(linkLine.replace(/LinkedIn:.*?(\||$)/, 'LinkedIn ').replace(/GitHub:.*?$/, ' GitHub'))) / 2;

            if (linkedin && isValidUrl(linkedin)) {
                doc.textWithLink('LinkedIn', currentX, linkLineY, { url: linkedin });
                currentX += doc.getTextWidth('LinkedIn') + 5;
            }
            if (linkedin && isValidUrl(linkedin) && portfolioGithubUrl && isValidUrl(portfolioGithubUrl)) {
                 doc.text('|', currentX, linkLineY);
                 currentX += doc.getTextWidth('|') + 5;
            }
            if (portfolioGithubUrl && isValidUrl(portfolioGithubUrl)) {
                doc.textWithLink('GitHub', currentX, linkLineY, { url: portfolioGithubUrl });
            }
            currentY += 9 * lineHeightMultiplier;
        }
        currentY += sectionSpacing;
      }

      // Summary
      if (resumeData.summary) {
        addSectionTitle('Summary');
        addWrappedText(resumeData.summary, margin, currentY, contentWidth, { fontSize: 10 });
      }

      // Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        addSectionTitle('Work Experience');
        resumeData.experience.forEach((exp: Experience) => {
          checkAndAddPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor('#000000');
          doc.text(exp.title, margin, currentY);
          
          let companyLine = exp.company;
          if (exp.location) companyLine += `, ${exp.location}`;
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor('#3498db');
          doc.text(companyLine, margin, currentY + 11 * lineHeightMultiplier * 0.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor('#555555');
          const dateText = `${exp.startDate || ''}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, currentY);
          currentY += 11 * lineHeightMultiplier * 0.8 + 10 * lineHeightMultiplier * 0.8;
          
          if (exp.description) {
            addWrappedText(exp.description, margin + 10, currentY, contentWidth - 10, { fontSize: 10 });
          }
          currentY += itemSpacing; 
        });
      }
      
      // Projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        addSectionTitle('Projects');
        resumeData.projects.forEach((proj: Project) => {
          checkAndAddPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor('#000000');
          let projectTitle = proj.title;
          doc.text(projectTitle, margin, currentY);
          if (proj.link && isValidUrl(proj.link)) {
            const titleWidth = doc.getTextWidth(projectTitle);
            doc.setFontSize(9);
            doc.setTextColor('#3498db');
            doc.textWithLink('(Link)', margin + titleWidth + 5, currentY, { url: proj.link });
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor('#555555');
          const dateText = `${proj.startDate || ''}${proj.endDate ? ` - ${proj.endDate}` : ''}`;
          if (dateText.replace(/\s|-/g, '')) { // Only print if there's actual date content
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, currentY);
          }
          currentY += 11 * lineHeightMultiplier;
          
          if (proj.description) {
            addWrappedText(proj.description, margin + 10, currentY, contentWidth - 10, { fontSize: 10 });
          }
          currentY += itemSpacing;
        });
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        addSectionTitle('Education');
        resumeData.education.forEach((edu: Education) => {
          checkAndAddPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor('#000000');
          doc.text(edu.degree, margin, currentY);

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor('#3498db');
          let institutionLine = edu.institution;
          if(edu.location) institutionLine += `, ${edu.location}`;
          doc.text(institutionLine, margin, currentY + 11 * lineHeightMultiplier * 0.8);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor('#555555');
          const dateText = `${edu.startDate || ''}${edu.endDate || edu.graduationYear ? ` - ${edu.endDate || edu.graduationYear}` : ''}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, currentY);
          currentY += 11 * lineHeightMultiplier * 0.8 + 10 * lineHeightMultiplier * 0.8;

          if (edu.gpa) {
             addWrappedText(`GPA: ${edu.gpa}`, margin + 10, currentY, contentWidth -10, {fontSize: 10});
          }
          if (edu.description) {
            addWrappedText(edu.description, margin + 10, currentY, contentWidth - 10, { fontSize: 10 });
          }
          currentY += itemSpacing;
        });
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        addSectionTitle('Skills');
        const skillsText = resumeData.skills.map((s: Skill) => s.value).join(', ');
        addWrappedText(skillsText, margin, currentY, contentWidth, { fontSize: 10 });
      }

      // Certifications
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        addSectionTitle('Certifications');
        resumeData.certifications.forEach((cert: Certification) => {
            checkAndAddPage();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor('#000000');
            let certTitle = cert.title;
            doc.text(certTitle, margin, currentY);
            if (cert.link && isValidUrl(cert.link)) {
                const titleWidth = doc.getTextWidth(certTitle);
                doc.setFontSize(9);
                doc.setTextColor('#3498db');
                doc.textWithLink('(Link)', margin + titleWidth + 5, currentY, { url: cert.link });
            }
            currentY += 10 * lineHeightMultiplier;

            if (cert.issuingOrganization) {
                 addWrappedText(`Issued by: ${cert.issuingOrganization}`, margin +10, currentY, contentWidth -10, {fontSize: 9, fontStyle: 'italic'});
            }
             const dateText = `${cert.issueDate ? `Issued: ${cert.issueDate}` : ''}${cert.expiryDate ? ` | Expires: ${cert.expiryDate}` : ''}`;
            if(dateText.replace(/\s|-|Issued:|Expires:|\|/gi, '')) {
                 addWrappedText(dateText, margin + 10, currentY, contentWidth -10, {fontSize: 9, color: '#555555'});
            }
            if (cert.description) {
                addWrappedText(cert.description, margin + 10, currentY, contentWidth - 10, { fontSize: 9 });
            }
            currentY += itemSpacing;
        });
      }
      
      // Languages
      if (resumeData.languages && resumeData.languages.length > 0) {
        addSectionTitle('Languages');
        const langText = resumeData.languages.map((l: Language) => `${l.language} (${l.proficiency})`).join('; ');
        addWrappedText(langText, margin, currentY, contentWidth, { fontSize: 10 });
      }

      // Achievements
      if (resumeData.achievements && resumeData.achievements.length > 0) {
        addSectionTitle('Achievements');
        resumeData.achievements.forEach((ach: Achievement) => {
          checkAndAddPage();
          addWrappedText(`• ${ach.value}`, margin, currentY, contentWidth, { fontSize: 10 });
        });
      }
      
      // Hobbies
      if (resumeData.hobbies && resumeData.hobbies.length > 0) {
        addSectionTitle('Hobbies');
        const hobbiesText = resumeData.hobbies.map((h: Hobby) => h.value).join(', ');
        addWrappedText(hobbiesText, margin, currentY, contentWidth, { fontSize: 10 });
      }

      // Volunteer Experience
      if (resumeData.volunteerExperience && resumeData.volunteerExperience.length > 0) {
        addSectionTitle('Volunteer Experience');
        resumeData.volunteerExperience.forEach((vol: VolunteerEntry) => {
          checkAndAddPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor('#000000');
          doc.text(vol.role || vol.title || 'Volunteer', margin, currentY);
          
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(10);
          doc.setTextColor('#3498db');
          doc.text(vol.organization + (vol.location ? `, ${vol.location}` : ''), margin, currentY + 11 * lineHeightMultiplier * 0.8);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor('#555555');
          const dateText = `${vol.startDate || ''}${vol.endDate ? ` - ${vol.endDate}` : ''}`;
          const dateWidth = doc.getTextWidth(dateText);
          doc.text(dateText, pageWidth - margin - dateWidth, currentY);
          currentY += 11 * lineHeightMultiplier * 0.8 + 10 * lineHeightMultiplier * 0.8;
          
          if (vol.description) {
            addWrappedText(vol.description, margin + 10, currentY, contentWidth - 10, { fontSize: 10 });
          }
          currentY += itemSpacing;
        });
      }

      // Publications
      if (resumeData.publications && resumeData.publications.length > 0) {
        addSectionTitle('Publications');
        resumeData.publications.forEach((pub: Publication) => {
          checkAndAddPage();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor('#000000');
          let pubTitle = pub.title;
          doc.text(pubTitle, margin, currentY);
          if (pub.link && isValidUrl(pub.link)) {
            const titleWidth = doc.getTextWidth(pubTitle);
            doc.setFontSize(9);
            doc.setTextColor('#3498db');
            doc.textWithLink('(Link)', margin + titleWidth + 5, currentY, { url: pub.link });
          }
          currentY += 10 * lineHeightMultiplier;

          if (pub.authors && pub.authors.length > 0) {
             addWrappedText(`Authors: ${pub.authors.join(', ')}`, margin +10, currentY, contentWidth -10, {fontSize: 9, fontStyle: 'italic'});
          }
          if (pub.journalOrConference) {
             addWrappedText(pub.journalOrConference, margin +10, currentY, contentWidth -10, {fontSize: 9});
          }
          if (pub.date) {
             addWrappedText(`Date: ${pub.date}`, margin +10, currentY, contentWidth -10, {fontSize: 9, color: '#555555'});
          }
          if (pub.description) {
            addWrappedText(pub.description, margin + 10, currentY, contentWidth - 10, { fontSize: 9 });
          }
          currentY += itemSpacing;
        });
      }


      doc.save(`${resumeData.personalDetails?.name?.replace(/\s+/g, '_') || 'resume'}_${new Date().toISOString().slice(0,10)}.pdf`);

    } catch (error) {
      console.error("Error generating PDF with jsPDF:", error);
      toast({
        title: "PDF Generation Error",
        description: "An unexpected error occurred while generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreparingPrint(false);
    }
  };
  
  const safeParseResultForPreview = ExtractResumeDataOutputSchema.safeParse(watchedData);
  const dataForPreview = safeParseResultForPreview.success
    ? safeParseResultForPreview.data
    : defaultResumeData;


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header id="page-header" className="py-6 px-4 md:px-8 bg-card shadow-md sticky top-0 z-50 print:hidden">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">ResumeAI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handlePrepareAndPrint} 
              variant="default" 
              size="lg"
              disabled={isPreparingPrint || isLoadingAI}
              className="w-full sm:w-auto"
            >
              {isPreparingPrint ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Printer className="mr-2 h-5 w-5" />}
              {isPreparingPrint ? 'Generating PDF...' : 'Save as PDF'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 print:p-0">
        <div className="grid lg:grid-cols-2 gap-8 items-start print:hidden print:grid-cols-1">
          <section id="input-section" className="space-y-8 print:hidden">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Upload Existing Resume</CardTitle>
                <CardDescription>
                  Upload your resume (PDF, DOC, DOCX, TXT) to auto-fill the form.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileSelect={handleFileUpload} isLoading={isLoadingAI} />
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Or, Build Your Resume Manually</CardTitle>
                 <CardDescription>
                  Fill in the details below. The preview will update as you type.
                  If data is invalid, the preview may show default content. PDF generation requires valid data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {isLoadingAI && (
                    <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-md">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Extracting data from your resume...</p>
                    </div>
                )}
                {!isLoadingAI && <ResumeForm form={form} onSubmit={handleFormSave} isSubmitting={form.formState.isSubmitting} />}
              </CardContent>
            </Card>
          </section>
          
          <section 
            id="preview-section" 
            className="sticky top-[calc(theme(spacing.28)_+_1rem)] lg:top-28 max-h-[calc(100vh_-_theme(spacing.28)_-_2rem)] lg:max-h-[calc(100vh_-_8rem)] overflow-y-auto rounded-lg shadow-xl border bg-card 
                       print:!static print:!top-0 print:!max-h-full print:!overflow-visible print:shadow-none print:border-none print:bg-transparent print:m-0 print:p-0 print:col-span-2"
          >
             <ResumePreview data={dataForPreview} />
          </section>
        </div>
      </main>
       <footer id="page-footer" className="py-6 mt-12 text-center text-muted-foreground border-t print:hidden">
        <p>&copy; {new Date().getFullYear()} ResumeAI. Built with passion.</p>
      </footer>
    </div>
  );
}
