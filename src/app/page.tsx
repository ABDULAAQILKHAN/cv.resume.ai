
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput, Experience, Education, Project, Certification } from '@/types/resume';
import { ExtractResumeDataOutputSchema, defaultResumeData } from '@/types/resume';
import { ResumeForm } from '@/components/resume-form';
import { FileUpload } from '@/components/file-upload';
import { ResumePreview } from '@/components/resume-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ExtractResumeDataOutput>({
    resolver: zodResolver(ExtractResumeDataOutputSchema),
    defaultValues: defaultResumeData,
  });

  const watchedData = form.watch();

  const handleFileUpload = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const resumeDataUri = await fileToDataUri(file);
      const extractedData = await extractResumeData({ resumeDataUri });
      
      const parsedData = ExtractResumeDataOutputSchema.parse(extractedData || {});
      form.reset(parsedData);

      toast({
        title: "Success!",
        description: "Resume data extracted and pre-filled.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error extracting resume data:", error);
      toast({
        title: "Error",
        description: "Failed to extract data from resume. Please try again or fill manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleFormSave = (values: ExtractResumeDataOutput) => {
    // This function is called when the form (if it had a submit button) is submitted.
    // Currently, data updates happen on field change and are reflected in `watchedData`.
    // We can use this to manually trigger a save or update if needed.
    console.log("Resume data saved/updated (manual trigger):", values);
    toast({
        title: "Resume Updated",
        description: "Your resume data has been updated in the form and preview.",
    });
  };

  const handleDownloadWithJsPDF = async (data: ExtractResumeDataOutput) => {
    setIsGeneratingPdf(true);
    try {
      const pdfData = ExtractResumeDataOutputSchema.parse(data);
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const usableWidth = pageWidth - 2 * margin;
      let currentY = margin;
      const lineHeight = 1.2;
      const sectionGap = 20;
      const itemGap = 10;

      const addPageIfNeeded = (heightEstimate: number) => {
        if (currentY + heightEstimate > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          currentY = margin;
        }
      };

      const addWrappedText = (text: string | undefined | null, x: number, y: number, maxWidth: number, options?: any) => {
        if (!text) return y;
        doc.setFontSize(options?.fontSize || 10);
        doc.setFont(options?.fontStyle || 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (options?.fontSize || 10) * lineHeight);
      };
      
      const addLink = (text: string, url: string, x: number, y: number, options?: any) => {
         doc.setFontSize(options?.fontSize || 10);
         doc.setTextColor(0, 0, 255); // Blue for links
         doc.textWithLink(text, x, y, { url });
         doc.setTextColor(0, 0, 0); // Reset color
         return y + (options?.fontSize || 10) * lineHeight;
      };


      // --- Personal Details ---
      if (pdfData.personalDetails) {
        const { name, email, phone, linkedin } = pdfData.personalDetails;
        if (name) {
          doc.setFontSize(24);
          doc.setFont('helvetica', 'bold');
          const nameWidth = doc.getTextWidth(name);
          addPageIfNeeded(30);
          doc.text(name, (pageWidth - nameWidth) / 2, currentY);
          currentY += 30;
        }
        
        const contactInfo = [];
        if (email) contactInfo.push(`Email: ${email}`);
        if (phone) contactInfo.push(`Phone: ${phone}`);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        contactInfo.forEach(info => {
          const infoWidth = doc.getTextWidth(info);
          addPageIfNeeded(12);
          doc.text(info, (pageWidth - infoWidth) / 2, currentY);
          currentY += 12;
        });
         if (linkedin) {
            const linkedInText = `LinkedIn: ${linkedin}`;
            const linkedInWidth = doc.getTextWidth(linkedInText);
            addPageIfNeeded(12);
            // jsPDF textWithLink needs careful handling for centering, let's keep it simple
            addLink(linkedInText, linkedin.startsWith('http') ? linkedin : `https://${linkedin}`, (pageWidth - linkedInWidth) / 2, currentY, { fontSize: 10});
            currentY += 12;
        }
        currentY += sectionGap / 2;
      }

      // --- Section Title Helper ---
      const addSectionTitle = (title: string) => {
        addPageIfNeeded(20 + sectionGap / 2);
        currentY += sectionGap / 2;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin, currentY);
        currentY += 20;
        // doc.setLineWidth(1);
        // doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5); // Underline
        // currentY += 5;
      };
      
      // --- Summary ---
      if (pdfData.summary) {
        addSectionTitle('Summary');
        currentY = addWrappedText(pdfData.summary, margin, currentY, usableWidth, { fontSize: 10 });
        currentY += sectionGap;
      }

      // --- Experience ---
      if (pdfData.experience && pdfData.experience.length > 0) {
        addSectionTitle('Work Experience');
        pdfData.experience.forEach((exp: Experience) => {
          addPageIfNeeded(15 + 12 + 12 + 30); // Estimate height
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(exp.title || '', margin, currentY);
          currentY += 15;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(`${exp.company || ''} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`, margin, currentY);
          currentY += 12;
          
          doc.setFont('helvetica', 'normal');
          currentY = addWrappedText(exp.description, margin + 15, currentY, usableWidth - 15, { fontSize: 10 });
          currentY += itemGap;
        });
        currentY += sectionGap;
      }
      
      // --- Projects ---
      if (pdfData.projects && pdfData.projects.length > 0) {
        addSectionTitle('Projects');
        pdfData.projects.forEach((proj: Project) => {
          addPageIfNeeded(15 + 12 + 12 + 30);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(proj.title || '', margin, currentY);
          if (proj.link) {
            const titleWidth = doc.getTextWidth(proj.title || '');
            addLink('[Link]', proj.link.startsWith('http') ? proj.link : `https://${proj.link}`, margin + titleWidth + 5, currentY -2, {fontSize: 10});
          }
          currentY += 15;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          const dates = [proj.startDate, proj.endDate].filter(Boolean).join(' - ');
          if (dates) {
            doc.text(dates, margin, currentY);
            currentY += 12;
          }
          
          doc.setFont('helvetica', 'normal');
          currentY = addWrappedText(proj.description, margin + 15, currentY, usableWidth - 15, { fontSize: 10 });
          currentY += itemGap;
        });
        currentY += sectionGap;
      }

      // --- Education ---
      if (pdfData.education && pdfData.education.length > 0) {
        addSectionTitle('Education');
        pdfData.education.forEach((edu: Education) => {
          addPageIfNeeded(15 + 12 + 12 + 20);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree || '', margin, currentY);
          currentY += 15;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text(`${edu.institution || ''} | ${edu.startDate || ''} - ${edu.endDate || ''}`, margin, currentY);
          currentY += 12;

          doc.setFont('helvetica', 'normal');
          currentY = addWrappedText(edu.description, margin + 15, currentY, usableWidth - 15, { fontSize: 10 });
          currentY += itemGap;
        });
        currentY += sectionGap;
      }
      
      // --- Skills ---
      if (pdfData.skills && pdfData.skills.length > 0) {
        addSectionTitle('Skills');
        addPageIfNeeded(15 * pdfData.skills.length);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const skillsText = pdfData.skills.map(s => s.value).join(', ');
        currentY = addWrappedText(skillsText, margin, currentY, usableWidth, {fontSize: 10});
        currentY += sectionGap;
      }
      
      // --- Certifications ---
      if (pdfData.certifications && pdfData.certifications.length > 0) {
        addSectionTitle('Certifications');
        pdfData.certifications.forEach((cert: Certification) => {
          addPageIfNeeded(15 + 12 + 12 + 20);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(cert.title || '', margin, currentY);
           if (cert.link) {
            const titleWidth = doc.getTextWidth(cert.title || '');
            addLink('[Link]', cert.link.startsWith('http') ? cert.link : `https://${cert.link}`, margin + titleWidth + 5, currentY - 2, {fontSize: 10});
          }
          currentY += 15;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          const dates = [cert.startDate, cert.endDate].filter(Boolean).join(' - ');
          if (dates) {
            doc.text(dates, margin, currentY);
            currentY += 12;
          }
          
          doc.setFont('helvetica', 'normal');
          currentY = addWrappedText(cert.description, margin + 15, currentY, usableWidth - 15, { fontSize: 10 });
          currentY += itemGap;
        });
        currentY += sectionGap;
      }

      // --- Achievements ---
      if (pdfData.achievements && pdfData.achievements.length > 0) {
        addSectionTitle('Achievements');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        pdfData.achievements.forEach(ach => {
          addPageIfNeeded(15);
          currentY = addWrappedText(`• ${ach.value || ''}`, margin, currentY, usableWidth, { fontSize: 10 });
          currentY += 5; // Smaller gap for list items
        });
        currentY += sectionGap;
      }

      // --- Hobbies ---
      if (pdfData.hobbies && pdfData.hobbies.length > 0) {
        addSectionTitle('Hobbies');
        addPageIfNeeded(15 * pdfData.hobbies.length);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const hobbiesText = pdfData.hobbies.map(h => h.value).join(', ');
        currentY = addWrappedText(hobbiesText, margin, currentY, usableWidth, {fontSize: 10});
        currentY += sectionGap;
      }

      const fileName = `${pdfData.personalDetails?.name?.replace(/\s+/g, '_') || 'Resume'}_ResumeAI.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Generated",
        description: `${fileName} has been downloaded.`,
      });

    } catch (error) {
      console.error("Error generating PDF with jsPDF:", error);
      toast({
        title: "PDF Generation Error",
        description: "Failed to generate PDF. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header id="page-header" className="py-6 px-4 md:px-8 bg-card shadow-md sticky top-0 z-50 print:hidden">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">ResumeAI</h1>
          </div>
          <div className="flex-shrink-0" id="download-button-container">
            <Button 
              onClick={() => handleDownloadWithJsPDF(watchedData)} 
              variant="default" 
              size="lg"
              disabled={isGeneratingPdf || isLoadingAI}
            >
              {isGeneratingPdf ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
              {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
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

          <section id="preview-section" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg shadow-xl border bg-card make-static-for-print print:max-h-full print:overflow-visible">
             <ResumePreview data={ExtractResumeDataOutputSchema.parse(watchedData)} />
          </section>
        </div>
      </main>
       <footer id="page-footer" className="py-6 mt-12 text-center text-muted-foreground border-t print:hidden">
        <p>&copy; {new Date().getFullYear()} ResumeAI. Built with/For passion.</p>
      </footer>
    </div>
  );
}