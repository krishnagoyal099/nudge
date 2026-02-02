"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link2, Coins, UserCircle, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const items = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Blinks",
        href: "/dashboard/links",
        icon: Link2,
    },
    {
        title: "Pool",
        href: "/dashboard/pool",
        icon: Coins,
    },
    {
        title: "Profile",
        href: "/dashboard/profile",
        icon: UserCircle,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (!publicKey) return;

        const fetchBalance = async () => {
            try {
                const bal = await connection.getBalance(publicKey);
                setBalance(bal / LAMPORTS_PER_SOL);
            } catch (e) {
                console.error("Failed to fetch balance", e);
            }
        };

        fetchBalance();
        const id = connection.onAccountChange(publicKey, (info) => {
            setBalance(info.lamports / LAMPORTS_PER_SOL);
        });

        return () => {
            connection.removeAccountChangeListener(id);
        };
    }, [publicKey, connection]);

    return (
        <div className="w-64 h-screen border-r border-white/5 bg-zinc-950 flex flex-col hidden md:flex sticky top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                    <Image
                        src="/nudge-symbol.png"
                        alt="Logo"
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="font-hero text-lg text-white tracking-widest">NUDGE</span>
            </div>

            {/* Wallet Balance Card */}
            <div className="mx-4 mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-3 h-3 text-zinc-500" />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Main Wallet</span>
                    <span className="ml-auto text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">DEVNET</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-xl font-mono text-white font-bold">
                        {balance !== null ? balance.toFixed(3) : "---"}
                    </span>
                    <span className="text-xs text-zinc-500">SOL</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-2 space-y-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                                isActive
                                    ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/20 shadow-[0_0_15px_-3px_rgba(247,39,152,0.3)]"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-neon-pink" : "text-zinc-500 group-hover:text-white")} />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto p-6 border-t border-white/5 bg-white/[0.02]">
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-400/50 transition-all font-display text-xs uppercase tracking-[0.2em]"
                >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                </button>
            </div>
        </div>
    );
}

// Mobile Navbar for smaller screens
export function MobileHeader() {
    const { logout } = useAuth();
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (!publicKey) return;
        const fetchBalance = async () => {
            const bal = await connection.getBalance(publicKey);
            setBalance(bal / LAMPORTS_PER_SOL);
        };
        fetchBalance();
    }, [publicKey, connection]);

    return (
        <div className="md:hidden h-20 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 relative rounded-lg overflow-hidden">
                    <Image
                        src="/nudge-symbol.png"
                        alt="Logo"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Balance</span>
                    <span className="text-white font-mono text-sm leading-tight">
                        {balance !== null ? balance.toFixed(2) : "--"} SOL
                    </span>
                </div>
            </div>

            <button onClick={logout} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    )
}

