
"use client";

import * as React from 'react';
// import { useRouter } from 'next/navigation'; // Not strictly needed now
import { ResumePreview } from '@/components/resume-preview';
import type { ExtractResumeDataOutput } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Printer, Loader2 } from 'lucide-react';
import { useResumeContext } from '@/context/resume-context';

export default function ResumePrintPage() {
  const [resumeDataToPrint, setResumeDataToPrint] = React.useState<ExtractResumeDataOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // const router = useRouter(); // Not strictly needed now
  const { state: resumeContextState } = useResumeContext();

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (resumeContextState.resume && resumeContextState.resume.personalDetails?.name) { // Check if context has meaningful data
      setResumeDataToPrint(resumeContextState.resume);
    } else {
      setError("No resume data found in context. Please go back and prepare your resume.");
      setResumeDataToPrint(defaultResumeData); // Show a blank preview or default
    }
    setIsLoading(false);
  }, [resumeContextState.resume]);

  React.useEffect(() => {
    if (resumeDataToPrint && resumeDataToPrint.personalDetails?.name && !error && !isLoading) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch(printError) {
          console.error("Error triggering print dialog:", printError);
          // Fallback or user notification if window.print() itself fails
           toast({ // Assuming toast is available or can be set up for this page too
            title: "Print Error",
            description: "Could not automatically open print dialog. Please use the button.",
            variant: "destructive",
          });
        }
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [resumeDataToPrint, error, isLoading]);

  const handleManualPrint = () => {
    if (resumeDataToPrint && resumeDataToPrint.personalDetails?.name) {
      window.print();
    } else {
      // Maybe show a toast from useToast if available here, or alert.
      alert("No resume data available to print.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-8">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-muted-foreground">Loading Resume for Printing...</p>
      </div>
    );
  }

  return (
    <div className="print-page-container bg-muted print:bg-white min-h-screen">
      <div className="print-controls p-4 text-center bg-card shadow-md print:hidden">
        <h1 className="text-2xl font-bold text-primary mb-2">Print Preview</h1>
        {error && (
          <div className="my-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2 justify-center">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {!error && (
            <p className="text-muted-foreground mb-4">
            Your resume should open in the print dialog. If not, use the button below.
            </p>
        )}
        <Button onClick={handleManualPrint} variant="default" size="lg" disabled={!!error || !resumeDataToPrint || !resumeDataToPrint.personalDetails?.name}>
          <Printer className="mr-2 h-5 w-5" /> Print Again / Save as PDF
        </Button>
      </div>
      
      <div className="resume-preview-wrapper p-0 md:p-8 print:p-0">
        <div className="a4-sheet bg-white shadow-lg mx-auto print:shadow-none print:m-0 print:p-0">
           {resumeDataToPrint ? <ResumePreview data={resumeDataToPrint} /> : <p>Loading preview...</p>}
           {!resumeDataToPrint && !isLoading && !error && <p className="text-center p-10">No resume data available to display.</p>}
        </div>
      </div>
    </div>
  );
}
