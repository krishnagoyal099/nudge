
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Link as LinkIcon,
    Settings,
    CreditCard,
    LogOut,
    BarChart3,
    Shield,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

const items = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Blinks", href: "/dashboard/links", icon: LinkIcon },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Plans", href: "/dashboard/pricing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useUser();

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-zinc-950/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col z-40 hidden md:flex">
            {/* Logo */}
            <Link href="/" className="mb-10 block">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-orange flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-display text-white">
                        Nudge<span className="text-neon-pink">.</span>
                    </span>
                </motion.div>
            </Link>

            {/* User Tier Badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 p-4 rounded-xl bg-gradient-to-r from-neon-pink/10 to-neon-orange/10 border border-neon-pink/20"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-neon-pink" />
                    <span className="text-sm font-medium text-neon-pink capitalize">
                        {user?.tier || "Free"} Plan
                    </span>
                </div>
                <p className="text-xs text-zinc-400">
                    {user?.tier === "free"
                        ? "Upgrade for unlimited blinks"
                        : "Full access enabled"}
                </p>
            </motion.div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {items.map((item, index) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isActive
                                        ? "text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-pink/20 to-neon-orange/10 border border-neon-pink/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={cn(
                                        "relative z-10 transition-colors",
                                        isActive && "text-neon-pink"
                                    )}
                                />
                                <span className="relative z-10 font-medium text-sm">{item.label}</span>

                                {/* Active indicator dot */}
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-neon-pink"
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                {/* Help Link */}
                <a
                    href="https://docs.nudge.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Help & Docs</span>
                </a>

                {/* Exit Button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5"
                >
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Disconnect</span>
                </button>
            </div>
        </aside>
    );
}
