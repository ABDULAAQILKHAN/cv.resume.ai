
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  acceptedFileTypes?: string; // e.g., ".pdf,.doc,.docx"
}

export function FileUpload({ onFileSelect, isLoading, acceptedFileTypes = ".pdf,.doc,.docx,.txt" }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resume-upload" className="sr-only">Upload Resume</Label>
        <Input
          id="resume-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={acceptedFileTypes}
          disabled={isLoading}
        />
        <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            disabled={isLoading}
            className="w-full"
        >
            <UploadCloud className="mr-2 h-4 w-4" />
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose Resume File'}
        </Button>
      </div>
      {selectedFile && (
        <Button
          type="button"
          onClick={handleUploadClick}
          disabled={isLoading || !selectedFile}
          className="w-full"
        >
          {isLoading ? 'Processing...' : 'Auto-fill from Resume'}
        </Button>
      )}
    </div>
  );
}
