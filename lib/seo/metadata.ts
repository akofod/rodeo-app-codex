import type { Metadata } from 'next';

import { siteName } from './site';

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | '/';
};

export const buildPageMetadata = ({
  title,
  description,
  path,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    title,
    description,
    url: path,
    siteName,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
});
