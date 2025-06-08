import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/navbar";
import { ThemeWrapper } from "@/components/theme-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet Tracker Dashboard",
  description: "Track your Solana wallet positions across different protocols",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ThemeWrapper>
          <Navbar />
          <main>{children}</main>
          </ThemeWrapper>
        </Providers>
      </body>
    </html>
  );
}
