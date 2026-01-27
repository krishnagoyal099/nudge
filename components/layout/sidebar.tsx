
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Link as LinkIcon, Settings, CreditCard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Links", href: "/dashboard/links", icon: LinkIcon },
    { label: "Plans", href: "/dashboard/pricing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-white/10 p-6 flex flex-col z-40 hidden md:flex">
            <Link href="/" className="mb-12 block">
                <span className="text-3xl font-display text-white">
                    Nudge<span className="text-neon-pink">.</span>
                </span>
            </Link>

            <nav className="flex-1 space-y-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                                isActive
                                    ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/20"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn(isActive && "text-neon-pink")} />
                            <span className="font-display tracking-wide text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-white/10">
                <Link href="/" className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white transition-colors">
                    <LogOut size={20} />
                    <span className="font-display tracking-wide text-sm">Exit</span>
                </Link>
            </div>
        </aside>
    );
}
