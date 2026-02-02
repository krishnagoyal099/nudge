"use client";

import { useAuth } from "@/contexts/auth-context";
import { UserCircle, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8 max-w-3xl">
            <header>
                <h1 className="text-3xl font-display text-white">Profile</h1>
                <p className="text-zinc-400">Manage your identity and security settings.</p>
            </header>

            {/* Identity Card */}
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-neon-pink to-purple-600 rounded-full flex items-center justify-center text-3xl font-display text-white">
                    {user.display_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-display text-white mb-2">{user.display_name}</h3>
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm bg-black/20 w-fit px-3 py-1 rounded-full mb-6">
                        <Key className="w-3 h-3" />
                        {user.public_key.slice(0, 4)}...{user.public_key.slice(-4)}
                    </div>
                </div>
                <Button variant="outline" onClick={logout} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    Disconnect
                </Button>
            </div>

            {/* Security Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-green-500" />
                        <h3 className="text-lg font-medium text-white">Security PIN</h3>
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">
                        Your PIN encrypts your local session. Changing it will require re-verification.
                    </p>
                    <Button disabled variant="secondary" className="w-full">
                        Reset PIN (Coming Soon)
                    </Button>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <UserCircle className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-lg font-medium text-white">Account Tier</h3>
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">
                        You are currently on the <strong className="text-white">Alpha</strong> plan. Enjoy unlimited privacy features for free.
                    </p>
                    <Button disabled variant="secondary" className="w-full opacity-50 cursor-not-allowed">
                        Upgrade (Free)
                    </Button>
                </div>
            </div>
        </div>
    );
}
