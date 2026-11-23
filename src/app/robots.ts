import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://permifest.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/kompetisi',
          '/kompetisi/*',
          '/guidebook',
          '/informasi',
          '/pengumuman',
          '/leaderboard',
          '/login',
          '/register',
        ],
        disallow: [
          '/dashboard/',
          '/dashboard/*',
          '/api/',
          '/api/*',
          '/admin/',
          '/juri/',
          '/peserta/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
