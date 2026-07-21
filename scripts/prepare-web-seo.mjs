import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const siteUrl = 'https://yatri-bice.vercel.app';
const title = 'Yatri - Nepal Travel Guide';
const description =
  'Yatri is a Nepal travel guide for local discovery, fair prices, safety alerts, emergency contacts, phrases, offline packs, and district-by-district trip planning.';

function injectHead(html) {
  const cleaned = html
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/\s*<meta name="description"[^>]*>\s*/g, '\n')
    .replace(/\s*<meta property="og:[^"]+"[^>]*>\s*/g, '\n')
    .replace(/\s*<meta name="twitter:[^"]+"[^>]*>\s*/g, '\n')
    .replace(/\s*<link rel="canonical"[^>]*>\s*/g, '\n')
    .replace(/\s*<script type="application\/ld\+json"[^>]*>.*?<\/script>\s*/gs, '\n');

  const tags = `
  <meta name="description" content="${description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${siteUrl}/" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${siteUrl}/" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${siteUrl}/assets/yatri-icon.png" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="theme-color" content="#07060f" />
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Yatri',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web, iOS, Android',
    url: `${siteUrl}/`,
    description
  })}</script>`;

  return cleaned.replace('</head>', `${tags}\n</head>`);
}

await mkdir(dist, { recursive: true });
await mkdir(join(dist, 'assets'), { recursive: true });

const indexPath = join(dist, 'index.html');
const html = await readFile(indexPath, 'utf8');
await writeFile(indexPath, injectHead(html));
await copyFile(join(root, 'assets', 'yatri-icon.png'), join(dist, 'assets', 'yatri-icon.png'));

await writeFile(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
);

await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`
);

console.log('Prepared web SEO files.');
