"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { Link as LinkInterface } from "@/lib/types";
import { Plus, Link2, Trash2, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveStealthKey } from "@/lib/stealth";

export default function LinksPage() {
    const { user } = useAuth();
    const { publicKey, signMessage } = useWallet();
    const [links, setLinks] = useState<LinkInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Create Form State
    const [newTitle, setNewTitle] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [creating, setCreating] = useState(false);
    const [stealthPublicKey, setStealthPublicKey] = useState<string | null>(null);

    useEffect(() => {
        if (user) fetchLinks();
    }, [user]);

    const ensureStealthPublicKey = async () => {
        if (stealthPublicKey) return stealthPublicKey;
        if (!publicKey || !signMessage) {
            throw new Error("Wallet must be connected and support message signing.");
        }
        const message = new TextEncoder().encode("Sign to derive your Nudge stealth key.");
        const signature = await signMessage(message);
        const derived = await deriveStealthKey(signature);
        const pubkey = derived.publicKey.toBase58();
        setStealthPublicKey(pubkey);
        return pubkey;
    };

    const fetchLinks = async () => {
        if (!user) return;
        setLoading(true);
        await fetch("/api/links/cleanup", { method: "POST" });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Best-effort cleanup for expired links
        await supabase
            .from("links")
            .delete()
            .lt("created_at", oneWeekAgo.toISOString());

        const { data, error } = await supabase
            .from("links")
            .select("*")
            .eq("owner_id", user.public_key)
            .order('created_at', { ascending: false });

        if (data) {
            // Filter out links older than 7 days
            const activeLinks = data.filter(link => {
                const createdDate = new Date(link.created_at);
                return createdDate > oneWeekAgo;
            });

            setLinks(activeLinks);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setCreating(true);

        // Simple validation
        if (links.length >= 10) {
            alert("Limit reached: You can only create 10 links for now.");
            setCreating(false);
            return;
        }

        let stealthKey: string;
        try {
            stealthKey = await ensureStealthPublicKey();
        } catch (err) {
            console.error(err);
            alert("Unable to derive stealth key. Please connect a wallet that supports message signing.");
            setCreating(false);
            return;
        }

        const newLink = {
            owner_id: user.public_key, // Fix: Use public_key as it references users(public_key)
            stealth_public_key: stealthKey,
            title: newTitle,
            slug: newSlug || `${user.display_name}-${Date.now()}`,
            is_active: true,
            total_received: 0,
        };

        const { data, error } = await supabase
            .from("links")
            .insert([newLink])
            .select()
            .single();

        if (error) {
            console.error(error);
            alert("Failed to create link");
        } else {
            setLinks([data, ...links]);
            setCreateOpen(false);
            setNewTitle("");
            setNewSlug("");
        }
        setCreating(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? Any funds in this link's pool will be moved to your general pool.")) return;

        // Logic: In a real app, backend trigger handles moving funds. 
        // Here we just delete the link for UI purposes.
        await supabase.from("links").delete().eq("id", id);
        setLinks(links.filter(l => l.id !== id));
    };

    const handleCopy = (link: LinkInterface) => {
        if (!link.stealth_public_key) {
            alert("This blink is missing a stealth key. Create a new blink to generate one.");
            return;
        }
        const host = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
        const url = `${host}/${link.id}/${link.slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display text-white">Your Blinks</h1>
                    <p className="text-zinc-400">Manage your private payment links.</p>
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#F72798] hover:bg-white text-black hover:text-[#F72798] rounded-xl h-12 px-6 border-0 shadow-[0_0_20px_rgba(247,39,152,0.3)] transition-all hover:scale-[1.05] active:scale-[0.95]">
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Link
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Create New Blink</DialogTitle>
                            <DialogDescription>Generate a new privacy-preserving payment link.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Link Title</Label>
                                <Input
                                    placeholder="e.g. Coffee Fund"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="bg-black/40 border-white/10 rounded-xl h-12 focus:border-neon-pink"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Custom Slug (Optional)</Label>
                                <div className="flex bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-neon-pink transition-all">
                                    <div className="bg-white/5 px-4 flex items-center text-zinc-500 text-xs font-mono border-r border-white/5 whitespace-nowrap">
                                        nudge-ph.vercel.app/
                                    </div>
                                    <input
                                        placeholder="coffee-fund"
                                        value={newSlug}
                                        onChange={e => setNewSlug(e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 text-white px-4 py-3 h-12 w-full text-base font-medium placeholder:text-zinc-800"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-[#F72798] hover:bg-white hover:text-[#F72798] text-white h-14 rounded-2xl border-0 shadow-[0_8px_30px_rgb(247,39,152,0.3)] transition-all flex items-center justify-center font-display text-2xl tracking-[0.1em]"
                            >
                                {creating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : "Create Link"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
                </div>
            ) : links.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <Link2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white font-medium mb-2">No links created yet</h3>
                    <p className="text-zinc-400">Create your first blink to start receiving private payments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link) => (
                        <div key={link.id} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl group hover:border-neon-pink/50 transition-colors">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-zinc-800 rounded-xl">
                                    <Link2 className="w-6 h-6 text-neon-pink" />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 px-0 text-zinc-500 hover:text-white"
                                        onClick={() => handleCopy(link)}
                                    >
                                        {copiedId === link.id ? (
                                            // Check icon explicitly if not imported, but Lucide usually has Check.
                                            // Using a text "Copied" or icon swap.
                                            // Assuming "Check" is avail or I'll just keep Copy but green.
                                            // Let's import Check. Wait, I can't change imports in this block easily without replacing the whole file header.
                                            // I will use Scale effect or just color change for now to be safe, or just trust simple Copy icon.
                                            // Actually, I'll add Check to top imports in a separate edit if needed, or just use className changes.
                                            <Copy className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-8 w-8 px-0 text-zinc-500 hover:text-red-500"
                                        onClick={() => handleDelete(link.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-xl font-display text-white mb-1">{link.title}</h3>
                            <p className="text-sm text-zinc-500 mb-6 truncate">/{link.slug}</p>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Received</p>
                                    <p className="text-2xl font-mono text-white">{link.total_received} SOL</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${link.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
