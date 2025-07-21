// c:\Users\biruk\Desktop\TMS\TMS-frontendd\src\app\layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationProvider } from "./contexts/NotificationContext"; // Ensure this path is correct
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TMS Application", // Example title
  description: "Transportation Management System", // Example description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          {/* If AdminLayout is here, or if Header is rendered directly by RootLayout's children */}
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
