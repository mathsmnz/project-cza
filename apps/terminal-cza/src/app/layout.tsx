import '@/app/ui/global.css';
import { Metadata } from 'next';
import { montserrat } from './ui/fonts';

export const metadata: Metadata = {
  title: {
    template: '%s | CZA+ Terminal',
    default: 'CZA+ Terminal',
  },
  description: 'CZA+ Terminal.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className}`}>{children}</body>
    </html>
  );
}
