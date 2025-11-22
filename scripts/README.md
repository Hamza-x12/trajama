# Sitemap Generator

This script automatically generates `public/sitemap.xml` based on the routes defined in `src/config/routes.ts`.

## Usage

Run the script whenever you add or modify routes:

```bash
npx tsx scripts/generate-sitemap.ts
```

## How It Works

1. Reads route configuration from `src/config/routes.ts`
2. Generates XML sitemap with current date as `lastmod`
3. Writes to `public/sitemap.xml`

## Adding New Routes

1. Add your route to `src/App.tsx`
2. Add the route configuration to `src/config/routes.ts`
3. Run the sitemap generator script
4. Publish your changes

The sitemap will automatically include all configured routes with proper SEO metadata.
