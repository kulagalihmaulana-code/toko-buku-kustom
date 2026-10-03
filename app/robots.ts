import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://toko-buku-kustom-t4mr.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile', '/orders/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}