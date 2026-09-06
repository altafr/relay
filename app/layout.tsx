import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://relay-agent-studio.weekendai-7238.chatgpt.site'),
  title: 'Relay — Multi-agent Content Studio',
  description: 'Turn one topic, URL, or idea into channel-ready social content with a team of specialist AI agents.',
  openGraph: {
    title: 'Relay — Multi-agent Content Studio',
    description: 'One idea. Every channel. Made together.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relay — Multi-agent Content Studio',
    description: 'One idea. Every channel. Made together.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
