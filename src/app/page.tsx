
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput } from '@/types/resume';
import { ExtractResumeDataOutputSchema, defaultResumeData } from '@/types/resume';
import { ResumeForm } from '@/components/resume-form';
import { FileUpload } from '@/components/file-upload';
import { ResumePreview } from '@/components/resume-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2 } from 'lucide-react';
import Image from 'next/image';


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
      
      const processedData: ExtractResumeDataOutput = {
        personalDetails: extractedData.personalDetails || defaultResumeData.personalDetails,
        summary: extractedData.summary || defaultResumeData.summary,
        // @ts-ignore
        experience: (extractedData.experience || []).map(exp => ({...exp})),
        // @ts-ignore
        education: (extractedData.education || []).map(edu => ({...edu})),
        // @ts-ignore
        skills: extractedData.skills ? extractedData.skills.map(skill => ({ value: typeof skill === 'string' ? skill : skill.value })) : [],
        // @ts-ignore
        projects: (extractedData.projects || []).map(proj => ({...proj})),
        // @ts-ignore
        certifications: (extractedData.certifications || []).map(cert => ({...cert})),
        // @ts-ignore
        achievements: extractedData.achievements ? extractedData.achievements.map(ach => ({ value: typeof ach === 'string' ? ach : ach.value })) : [],
        // @ts-ignore
        hobbies: extractedData.hobbies ? extractedData.hobbies.map(hob => ({ value: typeof hob === 'string' ? hob : hob.value })) : [],
      };
      
      form.reset(processedData);
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
    console.log("Resume data saved/updated:", values);
    toast({
        title: "Resume Updated",
        description: "Your resume data has been updated in the form and preview.",
    });
  };


  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header id="page-header" className="py-6 px-4 md:px-8 bg-card shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">ResumeAI</h1>
          </div>
          <div className="flex-shrink-0" id="download-button-container">
             <Button onClick={handleDownload} variant="default" size="lg">
              <Download className="mr-2 h-5 w-5" /> Download PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <section id="input-section" className="space-y-8">
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

          <section id="preview-section" className="sticky top-28  max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg shadow-xl border bg-card print:static print:max-h-full print:overflow-visible">
             <ResumePreview data={watchedData} />
          </section>
        </div>
      </main>
       <footer id="page-footer" className="py-6 mt-12 text-center text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} ResumeAI. Built with passion.</p>
      </footer>
    </div>
  );
}
