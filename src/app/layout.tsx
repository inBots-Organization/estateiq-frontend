import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LessonContextProvider } from '@/contexts/LessonContext';
import '@/styles/globals.css';

// IBM Plex Sans - Premium tech font for English
const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// IBM Plex Sans Arabic - Modern, highly readable Arabic font
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'INLEARN | AI-Powered Professional Training Platform',
  description: 'Transform your professional skills with intelligent AI training. Practice with realistic simulations, master video courses, and get real-time performance analytics.',
  keywords: ['professional training', 'AI simulation', 'sales training', 'Saudi Arabia', 'skill development', 'INLEARN'],
  authors: [{ name: 'INLEARN' }],
  openGraph: {
    title: 'INLEARN | AI-Powered Professional Training Platform',
    description: 'Transform your professional skills with intelligent AI training.',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#059669" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${ibmPlex.variable} ${ibmPlexArabic.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <LessonContextProvider>
              {children}
            </LessonContextProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
