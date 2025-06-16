
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput } from '@/types/resume';
import { ExtractResumeDataOutputSchema, defaultResumeData, LLMResumeDataOutputSchema } from '@/types/resume';
import { ResumeForm } from '@/components/resume-form';
import { FileUpload } from '@/components/file-upload';
import { ResumePreview } from '@/components/resume-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, FileText } from 'lucide-react';


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

  const form = useForm<ExtractResumeDataOutput>({
    resolver: zodResolver(ExtractResumeDataOutputSchema),
    defaultValues: defaultResumeData,
    mode: 'onBlur', // Validate on blur
  });

  const watchedData = form.watch();

  const handleFileUpload = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const resumeDataUri = await fileToDataUri(file);
      const extractedRawData = await extractResumeData({ resumeDataUri });

      // The extractResumeData flow already returns data transformed to ExtractResumeDataOutputSchema.
      // We just need to parse it to ensure full validation and application of defaults if any part was missed by AI.
      const validationResult = ExtractResumeDataOutputSchema.safeParse(extractedRawData || defaultResumeData);
      
      if (!validationResult.success) {
        console.error("Validation failed for AI extracted data:", validationResult.error.flatten());
        toast({
          title: "Data Parsing Error",
          description: "There was an issue processing some fields from the extracted resume data. Please review the form or try again.",
          variant: "destructive",
          duration: 7000,
        });
        // Reset with potentially partial but valid data or defaults
        form.reset(defaultResumeData); // Fallback to default if AI data is problematic
      } else {
        form.reset(validationResult.data);
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
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleFormSave = (values: ExtractResumeDataOutput) => {
    console.log("Resume data saved/updated (manual trigger):", values);
    toast({
        title: "Resume Updated",
        description: "Your resume data has been updated in the form and preview.",
    });
  };

  const handlePrepareAndPrint = () => {
    setIsPreparingPrint(true);
    try {
      const currentData = form.getValues();
      const validationResult = ExtractResumeDataOutputSchema.safeParse(currentData);

      if (!validationResult.success) {
        console.error("Form validation failed for printing:", validationResult.error.flatten());
        // Trigger validation messages in the form
        form.trigger(); 
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form before printing.",
          variant: "destructive",
        });
        setIsPreparingPrint(false);
        return;
      }
      
      // If validation is successful, proceed
      localStorage.setItem('resumePrintData', JSON.stringify(validationResult.data));
      
      const printWindow = window.open('/resume-print', '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        toast({
          title: "Popup Blocked?",
          description: "Could not open print preview window. Please allow popups for this site.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error preparing data for print:", error);
      toast({
        title: "Error",
        description: "Could not prepare data for printing.",
        variant: "destructive",
      });
    } finally {
      // Add a slight delay to allow the new tab to open before resetting loading state
      setTimeout(() => setIsPreparingPrint(false), 1000); 
    }
  };
  
  // For the live preview on the main page:
  // Only show data in preview if it's valid according to the schema. Otherwise, show default (empty) data.
  // This makes the preview's behavior consistent with the print functionality's data requirements.
  const validationResultForPreview = ExtractResumeDataOutputSchema.safeParse(watchedData);
  const dataForPreview = validationResultForPreview.success
    ? validationResultForPreview.data
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
              {isPreparingPrint ? 'Preparing...' : 'Save as PDF / Print'}
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
                  Fill in the details below. The preview will update as you type. If data seems invalid, the preview may show a default state.
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

          {/* Sticky Preview Section */}
          {/* Ensure top value accounts for potentially taller sticky header on mobile */}
          <section 
            id="preview-section" 
            className="sticky top-[calc(theme(spacing.28)_+_1rem)] lg:top-28 max-h-[calc(100vh_-_theme(spacing.28)_-_2rem)] lg:max-h-[calc(100vh_-_8rem)] overflow-y-auto rounded-lg shadow-xl border bg-card make-static-for-print print:shadow-none print:border-none print:bg-transparent print:max-h-full print:overflow-visible"
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
