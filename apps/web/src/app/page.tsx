import type { Metadata } from 'next';
import { LandingPageView } from '../features/landing/LandingPageView';

export const metadata: Metadata = {
  title: 'DevBlueprint | Developer Documentation & Engineering Blueprint Platform',
  description:
    'Your software architecture deserves more than scattered Markdown files. Plan, document, organize, and manage every engineering decision before writing code.',
  keywords: [
    'software blueprint',
    'developer documentation',
    'engineering architecture',
    'system design',
    'API contracts',
    'database schemas',
    'markdown documentation',
    'technical specs'
  ],
  authors: [{ name: 'DevBlueprint Engineering' }],
  creator: 'DevBlueprint',
  publisher: 'DevBlueprint Inc.',
  metadataBase: new URL('https://devblueprint.io'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devblueprint.io',
    siteName: 'DevBlueprint',
    title: 'DevBlueprint | Build Better Software. Start With a Better Blueprint.',
    description:
      'Plan, define, organize, maintain, and export technical software architecture blueprints before writing application code.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'DevBlueprint Platform Interface'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevBlueprint | Build Better Software. Start With a Better Blueprint.',
    description:
      'Your software architecture deserves more than scattered Markdown files. Centralized engineering blueprint management.',
    creator: '@devblueprint'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DevBlueprint',
    operatingSystem: 'All',
    applicationCategory: 'DeveloperApplication',
    description:
      'Centralized documentation and engineering blueprint management platform for software teams.',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPageView />
    </>
  );
}
