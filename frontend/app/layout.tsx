import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ApprovalFlow AI — AICTE Approval & Compliance System',
  description: 'Smart India Hackathon 2026 Solution for PS4: Workflow Automation, EVC Queue, Compliance & SLA Monitoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
