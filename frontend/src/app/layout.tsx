import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Butterfly SMART TV | Brighter Colours. Smarter Living.',
  description:
    'Experience stunning visuals, immersive sound, and smart features — all in one with Butterfly Smart TV.',
  icons: {
    icon: [
      { url: '/brand/butterfly-wordmark-badge.png' },
      { url: '/icon.png' },
      { url: '/favicon.ico' },
    ],
    apple: '/brand/butterfly-wordmark-badge.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 min-h-screen flex flex-col`}
      >
        <AppProviders>
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
