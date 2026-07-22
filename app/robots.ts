import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://plataforma.shop';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/main/',
          '/admin/',
          '/onboarding/',
          '/api/',
          '/*?*'
        ],
      },
      // 🤖 GEO (Generative Engine Optimization) - Permissão expressa para Bots de Inteligência Artificial
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Bytespider',
          'Applebot-Extended'
        ],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/main/',
          '/admin/',
          '/onboarding/',
          '/api/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
