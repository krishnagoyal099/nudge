import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const csDespina = localFont({
  src: "./fonts/CSDespina-Regular.otf",
  variable: "--font-display",
});

const popfine = localFont({
  src: "./fonts/POPFINERegular.otf",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Nudge | High-Fidelity Private Payments",
  description: "Receive payments privately with style. The most premium privacy experience on Solana.",
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
      <body className={`${csDespina.variable} ${popfine.variable} min-h-screen bg-background text-foreground antialiased overflow-x-hidden font-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}