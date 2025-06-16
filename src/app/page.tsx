
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import html2pdf from 'html2pdf.js'; // Removed static import
import { extractResumeData } from '@/ai/flows/extract-resume-data';
import type { ExtractResumeDataOutput } from '@/types/resume';
import { ExtractResumeDataOutputSchema, defaultResumeData } from '@/types/resume';
import { ResumeForm } from '@/components/resume-form';
import { FileUpload } from '@/components/file-upload';
import { ResumePreview } from '@/components/resume-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, FileText } from 'lucide-react';
import { useResumeContext } from '@/context/resume-context';


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
  const previewRef = React.useRef<HTMLDivElement>(null);

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
      const extractedDataFromAI = await extractResumeData({ resumeDataUri });
      
      // The data from extractResumeData is already transformed to ExtractResumeDataOutputSchema
      // We just need to validate it.
      const validationResult = ExtractResumeDataOutputSchema.safeParse(extractedDataFromAI || {});
      
      if (!validationResult.success) {
        console.error("Validation failed for AI extracted data:", validationResult.error.flatten());
        toast({
          title: "Data Parsing Error",
          description: "There was an issue processing some fields from the extracted resume data. Please review the form or try again.",
          variant: "destructive",
          duration: 7000,
        });
        // Reset with whatever AI gave if partially useful, or default
        form.reset(extractedDataFromAI && typeof extractedDataFromAI === 'object' ? extractedDataFromAI : defaultResumeData);
      } else {
        form.reset(validationResult.data);
        dispatch({ type: 'SET_RESUME_DATA', payload: validationResult.data }); // Update context
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
      form.reset(defaultResumeData); // Reset to default on error
      dispatch({ type: 'SET_RESUME_DATA', payload: defaultResumeData }); // Update context with default
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleFormSave = (values: ExtractResumeDataOutput) => {
    // This function is called by ResumeForm's onSubmit.
    // We update the context here as well if the form is manually submitted/validated.
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
      
      dispatch({ type: 'SET_RESUME_DATA', payload: validationResult.data });
      
      // Ensure the previewRef points to the element we want to print
      const element = previewRef.current; 
      if (element) {
        const html2pdf = (await import('html2pdf.js')).default;

        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5], // inches [top, left, bottom, right]
          filename:     `${validationResult.data.personalDetails?.name?.replace(/\s+/g, '_') || 'resume'}_${new Date().toISOString().slice(0,10)}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 }, // JPEG can lead to non-selectable text if not careful
          html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true }, // Added letterRendering
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] } 
        };
        
        const previewSectionEl = document.getElementById('preview-section');
        let originalOverflow = '';
        let originalMaxHeight = '';

        if (previewSectionEl) {
            originalOverflow = previewSectionEl.style.overflowY;
            originalMaxHeight = previewSectionEl.style.maxHeight;
            // Temporarily change styles for full content capture
            previewSectionEl.style.overflowY = 'visible'; 
            previewSectionEl.style.maxHeight = 'none';    
        }

        await html2pdf().from(element).set(opt).save();
        
        // Restore original styles
        if (previewSectionEl) {
            previewSectionEl.style.overflowY = originalOverflow;
            previewSectionEl.style.maxHeight = originalMaxHeight;
        }

      } else {
        toast({
          title: "Preview Element Not Found",
          description: "Could not find the resume preview to generate PDF.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error generating PDF with html2pdf.js:", error);
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
             <ResumePreview ref={previewRef} data={dataForPreview} />
          </section>
        </div>
      </main>
       <footer id="page-footer" className="py-6 mt-12 text-center text-muted-foreground border-t print:hidden">
        <p>&copy; {new Date().getFullYear()} ResumeAI. Built with passion.</p>
      </footer>
    </div>
  );
}
