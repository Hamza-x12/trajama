export interface RouteConfig {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly'
  },
  {
    path: '/learn',
    priority: 0.9,
    changefreq: 'weekly'
  },
  {
    path: '/auth',
    priority: 0.8,
    changefreq: 'monthly'
  },
  {
    path: '/dictionary',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/about',
    priority: 0.7,
    changefreq: 'monthly'
  },
  {
    path: '/faq',
    priority: 0.7,
    changefreq: 'monthly'
  },
  {
    path: '/dictionary/faq',
    priority: 0.6,
    changefreq: 'monthly'
  },
  {
    path: '/contact',
    priority: 0.6,
    changefreq: 'monthly'
  }
];
