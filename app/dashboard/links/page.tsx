
"use client";

import { LinkCard } from "@/components/dashboard/link-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LinksPage() {
    const mockLinks = [
        { id: 1, label: "Coffee Fund", url: "https://dial.to/...", clicks: 42, total: 2.5 },
        { id: 2, label: "Freelance", url: "https://dial.to/...", clicks: 12, total: 10.0 },
        { id: 3, label: "Twitter Tip Jar", url: "https://dial.to/...", clicks: 154, total: 0.8 },
        { id: 4, label: "Discord Sub", url: "https://dial.to/...", clicks: 8, total: 0.1 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display text-white">My Links</h1>
                    <p className="text-zinc-400">Manage your active payments.</p>
                </div>
                <Button variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> New Blink
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockLinks.map(link => (
                    <LinkCard
                        key={link.id}
                        label={link.label}
                        url={link.url}
                        clicks={link.clicks}
                        totalReceived={link.total}
                        onCopy={() => { }}
                        onClick={() => { }}
                    />
                ))}
            </div>
        </div>
    )
}
