
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-500",
                scrolled ? "bg-background/90 backdrop-blur-md py-4 border-b border-white/5" : "bg-transparent"
            )}
        >
            {/* Logo */}
            <Link href="/" className="group relative z-50">
                <span className="text-4xl font-display text-white group-hover:text-neon-pink transition-colors duration-300">
                    Nudge
                    <span className="text-neon-yellow">.</span>
                </span>
            </Link>

            {/* Desktop Links (Placeholder for now) */}
            <div className="hidden md:flex gap-8 items-center text-sm font-body uppercase tracking-widest text-zinc-400">
                <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>

            {/* Wallet Button - Styled to match theme */}
            <div className="z-50">
                <WalletMultiButton style={{
                    backgroundColor: "transparent",
                    border: "1px solid white",
                    borderRadius: "0px",
                    color: "white",
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    fontSize: "14px",
                    height: "48px",
                    padding: "0 24px",
                }} />
            </div>
        </nav>
    );
}
