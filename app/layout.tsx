import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jesseremedies.com'),
  title: 'Jesse Remedies | Simple, Fast & Fair Loans',
  description:
    'Transparent loan products and clear repayment plans for employees and growing businesses in Lagos.',
  openGraph: {
    title: 'Your next move, made possible. | Jesse Remedies',
    description:
      'Simple, fast and fair loans for employees and growing businesses in Lagos.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your next move, made possible. | Jesse Remedies',
    description:
      'Simple, fast and fair loans for employees and growing businesses in Lagos.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
