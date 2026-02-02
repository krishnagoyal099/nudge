"use client";

import { useAuth } from "@/contexts/auth-context";
import { ArrowUpRight, Plus, Wallet, Activity } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();

    // Mock Data for now
    const stats = {
        totalReceived: 0,
        activeLinks: 0,
        poolBalance: 0,
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display text-white">Dashboard</h1>
                    <p className="text-zinc-400">Welcome back, {user?.display_name || "Ghost"}.</p>
                </div>
                <Link
                    href="/dashboard/links"
                    className="inline-flex items-center gap-2 bg-neon-pink text-white px-6 py-3 rounded-xl font-medium hover:bg-neon-pink/80 transition-colors w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Create New Blink
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-12 h-12 text-neon-pink" />
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Total Cleaned</p>
                    <h3 className="text-4xl font-display text-white">{stats.totalReceived} SOL</h3>
                    <div className="mt-4 text-xs text-zinc-500 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">0%</span> this month
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-12 h-12 text-cyan-400" />
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Active Links</p>
                    <h3 className="text-4xl font-display text-white">{stats.activeLinks}/10</h3>
                    <div className="mt-4 text-xs text-zinc-500">
                        Limit: 10 Links
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-12 h-12 text-neon-yellow" />
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Pool Balance</p>
                    <h3 className="text-4xl font-display text-white">{stats.poolBalance} SOL</h3>
                    <div className="mt-4 text-xs text-zinc-500">
                        Available to withdraw
                    </div>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-xl font-display text-white mb-2">No Recent Activity</h3>
                <p className="text-zinc-400 max-w-sm mx-auto">
                    Transactions will appear here once you start receiving payments through your Blinks.
                </p>
            </div>
        </div>
    );
}