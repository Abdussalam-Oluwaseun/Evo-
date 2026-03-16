import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'evo | AI Career Assistant',
  description: 'Optimize your job applications with AI-powered resume tailoring and cover letter generation.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" sizes="any" />
      </head>
      <body suppressHydrationWarning className="bg-[#f6f6f8] text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
