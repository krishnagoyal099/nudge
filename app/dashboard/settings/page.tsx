
"use client";

import { User, Shield, Moon, Monitor } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { user, logout } = useUser();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div>
                <h1 className="text-3xl font-display text-white">Settings</h1>
                <p className="text-zinc-400">Manage your account and preferences.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Account Section */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="text-neon-pink" size={24} />
                        <h2 className="text-xl font-display text-white">Account</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Wallet Address</label>
                            <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-zinc-300 text-sm truncate">
                                {user?.wallet_address || "Not connected"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-zinc-500 uppercase mb-2">Display Name</label>
                            <input
                                type="text"
                                placeholder="Enter a display name"
                                className="w-full p-3 rounded-lg bg-black/40 border border-white/5 font-body text-white focus:border-neon-pink focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <Button variant="ghost" onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            Disconnect Wallet
                        </Button>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="p-8 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Monitor className="text-neon-yellow" size={24} />
                        <h2 className="text-xl font-display text-white">Appearance</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-white/5">
                                <Moon size={18} className="text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Theme</p>
                                <p className="text-zinc-500 text-sm">Customize your interface theme</p>
                            </div>
                        </div>

                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button className="px-4 py-2 rounded-md bg-zinc-800 text-white text-xs font-bold">Dark</button>
                            <button className="px-4 py-2 rounded-md text-zinc-500 hover:text-white text-xs font-bold transition-colors">Light</button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neon-yellow/10 bg-neon-yellow/5">
                        <p className="text-sm text-neon-yellow/80">
                            <span className="font-bold mr-2">Note:</span>
                            Light mode is currently experimental and may not support all magazine aesthetic features.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
