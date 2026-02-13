import type { Metadata } from 'next';
import { Inter, Cairo, Alexandria } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LessonContextProvider } from '@/contexts/LessonContext';
import '@/styles/globals.css';

// Inter - Premium tech font for English (clean, modern)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// Cairo - Premium Arabic font for body text (highly readable)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

// Alexandria - Premium Arabic font for headings (modern, elegant)
const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-alexandria',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'INLEARN | AI-Powered Professional Training Platform',
  description: 'Transform your professional skills with intelligent AI training. Practice with realistic simulations, master video courses, and get real-time performance analytics.',
  keywords: ['professional training', 'AI simulation', 'sales training', 'Saudi Arabia', 'skill development', 'INLEARN'],
  authors: [{ name: 'INLEARN' }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
      </head>
      <body
        className={`${inter.variable} ${cairo.variable} ${alexandria.variable} font-sans antialiased`}
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
