import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nudge | Private Solana Blinks",
  description: "Receive SOL privately without revealing your main address.",
  // Open Graph Image for social sharing
  openGraph: {
    images: ["/nudge-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}