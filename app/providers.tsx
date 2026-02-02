"use client";

import React, { useMemo, useEffect } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
// --- CHANGED IMPORTS START ---
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
// --- CHANGED IMPORTS END ---
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import { AuthProvider } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export function Providers({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com", []);

    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("[Supabase] Missing environment variables.");
            return;
        }

        const checkSupabaseConnection = async () => {
            try {
                const { error } = await supabase.auth.getSession();
                if (error) {
                    console.error("[Supabase] Connection check failed:", error.message);
                } else {
                    console.info("[Supabase] Connection check succeeded.");
                }
            } catch (err) {
                console.error("[Supabase] Connection check error:", err);
            }
        };

        checkSupabaseConnection();
    }, []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            // new SolflareWalletAdapter()
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <AuthProvider>{children}</AuthProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}