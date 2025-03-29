'use client';
import { Inter } from 'next/font/google';
import TMSSidebar from './components/TMSSidebar';
import TMSHeader from './components/TMSHeader';
import './../../app/styles/tms-theme.css';

// src/app/tms-module/layout.tsx

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function TMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-gray-50 text-gray-800">
      <div className="flex h-screen overflow-hidden">
            <TMSSidebar />
            <div className="flex-1 flex flex-col">
              <TMSHeader />
              <main className="flex-1 overflow-y-auto p-6 bg-white">
                {children}
              </main>
            </div>
          </div>
      </body>
    </html>
  );
}

