import type { Metadata } from 'next';
import { Inter, Montserrat, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const jetbrains = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Video Empire AI - AI-Powered Video Strategy Generator',
  description: 'Generate production-ready video scripts, monetization strategies, and viral hooks in seconds. Built for creators who want to dominate YouTube, TikTok, and Reels.',
  keywords: ['AI video generator', 'YouTube automation', 'video script AI', 'viral content', 'content strategy AI'],
  openGraph: {
    title: 'Video Empire AI',
    description: 'Your AI Video Strategy Director',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} ${jetbrains.variable}`}>
      <body className="bg-empire-black text-white antialiased">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid #FFD700',
            },
          }}
        />
      </body>
    </html>
  );
}
