import type { Metadata } from "next";
import localFont from "next/font/local";
import { Dancing_Script, Archivo_Black } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Replaced CSDespina with Popfine for Display/Titles as requested
const popfine = localFont({
  src: "./fonts/POPFINERegular.otf",
  variable: "--font-display",
  display: "swap",
});

// Added Aveton for Body text as requested
const aveton = localFont({
  src: "./fonts/Aveton.otf",
  variable: "--font-body",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-script",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton", // Keeping var name to avoid breaking tailwind
});

const despina = localFont({
  src: "./fonts/CSDespina-Regular.otf",
  variable: "--font-despina",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://nudge-ph.vercel.app"),
  title: "Nudge | High-Fidelity Private Payments",
  description: "Receive payments privately with style. The most premium privacy experience on Solana.",
  openGraph: {
    images: ["public/nudge-symbol.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${popfine.variable} ${aveton.variable} ${dancingScript.variable} ${archivoBlack.variable} ${despina.variable} min-h-screen bg-background text-foreground antialiased overflow-x-hidden font-body`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}