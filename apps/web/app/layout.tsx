import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'WatchWave — Better together', description: 'A synchronized movie night for everyone, everywhere.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
