import './globals.css';
import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, Playfair_Display, Alex_Brush } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['italic', 'normal'],
  display: 'swap',
});

const alexBrush = Alex_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-cursive',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ApprovalFlow AI — AICTE Approval & Compliance System',
  description: 'Smart India Hackathon 2026 Solution for PS4: Integrated Approval Workflow Automation, Compliance Monitoring, and SLA Escalation System.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable} ${playfair.variable} ${alexBrush.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#07090D] text-platinum-100 font-sans selection:bg-wine-700 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
