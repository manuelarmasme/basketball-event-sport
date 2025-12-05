import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/ui/navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reskata, Torneo 1vs1 de Basket",
  description:
    "Organiza y gestiona torneos de baloncesto 1vs1 de manera sencilla y divertida.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main className="h-full mx-auto max-w-7xl p-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
