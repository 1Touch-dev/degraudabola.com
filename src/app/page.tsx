import type { Metadata } from 'next';
import HomeLayout from '@/components/home/HomeLayout';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = pageMetadata({
  description: siteConfig.description,
  path: '/',
});

export default function HomePage() {
  return <HomeLayout />;
}
