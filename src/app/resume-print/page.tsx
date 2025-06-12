
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ResumePreview } from '@/components/resume-preview';
import type { ExtractResumeDataOutput } from '@/types/resume';
import { defaultResumeData, ExtractResumeDataOutputSchema } from '@/types/resume';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Printer, Loader2 } from 'lucide-react';

export default function ResumePrintPage() {
  const [resumeData, setResumeData] = React.useState<ExtractResumeDataOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    try {
      const storedData = localStorage.getItem('resumePrintData');
      if (storedData) {
        const parsedJson = JSON.parse(storedData);
        // Validate data loaded from localStorage
        const validationResult = ExtractResumeDataOutputSchema.safeParse(parsedJson);
        if (validationResult.success) {
          setResumeData(validationResult.data);
        } else {
          console.error("Invalid data found in localStorage for print:", validationResult.error.flatten());
          setError("The resume data is invalid or corrupted. Please try generating it again.");
          setResumeData(defaultResumeData); // Show a blank preview or default
        }
      } else {
        setError("No resume data found. Please go back and prepare your resume.");
        setResumeData(defaultResumeData); // Show a blank preview or default
      }
    } catch (e) {
      console.error("Error loading resume data from localStorage:", e);
      setError("Could not load resume data. It might be corrupted.");
      setResumeData(defaultResumeData); // Show a blank preview or default
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (resumeData && !error && !isLoading) {
      // Small delay to ensure content is rendered before printing
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch(printError) {
          console.error("Error triggering print dialog:", printError);
          // Fallback or user notification if window.print() itself fails
        }
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [resumeData, error, isLoading]);

  const handleManualPrint = () => {
    window.print();
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
        <p className="text-muted-foreground mb-4">
          Your resume should open in the print dialog. If not, use the button below.
        </p>
        <Button onClick={handleManualPrint} variant="default" size="lg">
          <Printer className="mr-2 h-5 w-5" /> Print Again / Save as PDF
        </Button>
        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
      </div>
      
      {/* The ResumePreview component will be styled by print CSS from globals.css */}
      {/* Adding a wrapper for potential A4 styling for screen preview */}
      <div className="resume-preview-wrapper p-0 md:p-8 print:p-0">
        <div className="a4-sheet bg-white shadow-lg mx-auto print:shadow-none print:m-0 print:p-0">
           {resumeData ? <ResumePreview data={resumeData} /> : <p>Loading preview...</p>}
        </div>
      </div>
    </div>
  );
}
