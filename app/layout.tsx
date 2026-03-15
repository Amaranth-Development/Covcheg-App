import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'COVCHEG.UA',
  description: 'First AI Helper',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
