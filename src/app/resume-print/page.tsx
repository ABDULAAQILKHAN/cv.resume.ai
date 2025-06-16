
// This file is no longer used for the primary PDF generation flow.
// It can be deleted or kept for other potential uses if needed.
// For now, it will just render a message.

"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResumePrintPageObsolete() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-8 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">Print Page (Obsolete)</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Resume printing is now handled directly on the main page.
        This page is no longer used for the primary "Save as PDF / Print" functionality.
      </p>
      <Button asChild>
        <Link href="/">Go back to Resume Builder</Link>
      </Button>
    </div>
  );
}
