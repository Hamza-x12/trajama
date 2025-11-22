import { writeFileSync } from 'fs';
import { join } from 'path';
import { routes } from '../src/config/routes.js';

const SITE_URL = "https://tarjama.lovable.app";

const generateSitemap = (): string => {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = routes.map(route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');

console.log('✓ Sitemap generated successfully at public/sitemap.xml');
