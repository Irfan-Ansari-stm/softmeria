import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/projects/*/docs/']
    },
    sitemap: 'https://devblueprint.io/sitemap.xml'
  };
}

