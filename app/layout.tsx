import type { Metadata } from "next";
import "@/lib/env"; // Validate env vars on startup
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeCarePlus - Construction & Maintenance",
  description: "One Call Can Solve All Your House Problems. Professional home maintenance services including plumbing, electrical, flooring, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
