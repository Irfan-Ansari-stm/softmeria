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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('devblueprint_theme');
                  if (stored === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-500 selection:text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
