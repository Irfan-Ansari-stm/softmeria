import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'DevBlueprint | Developer Documentation & Engineering Blueprint Platform',
  description:
    'Plan, define, organize, maintain, and export technical software architecture blueprints before writing application code.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

