import type { Metadata } from "next";
import "@/lib/env"; // Validate env vars on startup
import { Josefin_Sans, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--e-global-typography-text-font-family",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--wdtFontTypo_Alt",
});

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
      <body className={`${poppins.variable} ${josefinSans.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
