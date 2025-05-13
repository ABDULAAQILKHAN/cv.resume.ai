import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

// GeistSans and GeistMono from the 'geist' package export objects
// that already have a `variable` property.
// --font-geist-sans and --font-geist-mono are CSS variables names provided by these objects.

export const metadata: Metadata = {
  title: 'ResumeAI',
  description: 'Build your resume with AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
