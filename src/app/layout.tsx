import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NihonAustralia Admin',
  description: 'Admin panel for NihonAustralia platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <ReactQueryClientProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ReactQueryClientProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}