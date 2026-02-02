"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Link2,
    Plus,
    Copy,
    ExternalLink,
    MoreVertical,
    Trash2,
    Edit3,
    Eye,
    AlertTriangle,
    Check,
    X as CloseIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, EmptyState } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface BlinkLink {
    id: string;
    label: string;
    slug: string;
    stealthPublicKey: string;
    createdAt: Date;
    clicks: number;
    totalReceived: number;
    isActive: boolean;
    pendingBalance?: number;
}

interface LinkManagerProps {
    links: BlinkLink[];
    maxLinks?: number;
    stealthPublicKey: string | null;
    onCreateLink: (label: string, slug: string) => Promise<void>;
    onDeleteLink: (id: string) => Promise<void>;
    onEditLink: (id: string, label: string, slug: string) => Promise<void>;
}

export function LinkManager({
    links,
    maxLinks = 15,
    stealthPublicKey,
    onCreateLink,
    onDeleteLink,
    onEditLink
}: LinkManagerProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedLink, setSelectedLink] = useState<BlinkLink | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Form states
    const [newLabel, setNewLabel] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [slugError, setSlugError] = useState<string | null>(null);

    const canCreateMore = links.length < maxLinks;
    const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

    const generateBlinkUrl = (slug: string) => {
        return `${hostUrl}/api/actions/nudge?id=${encodeURIComponent(slug)}`;
    };

    const validateSlug = (slug: string) => {
        if (!slug) return "Slug is required";
        if (slug.length < 3) return "Slug must be at least 3 characters";
        if (slug.length > 30) return "Slug must be less than 30 characters";
        if (!/^[a-z0-9-]+$/.test(slug)) return "Only lowercase letters, numbers, and hyphens allowed";
        if (links.some(l => l.slug === slug && l.id !== selectedLink?.id)) return "Slug already taken";
        return null;
    };

    const handleCreate = async () => {
        const error = validateSlug(newSlug);
        if (error) {
            setSlugError(error);
            return;
        }

        setIsLoading(true);
        try {
            await onCreateLink(newLabel, newSlug);
            setIsCreateOpen(false);
            setNewLabel("");
            setNewSlug("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedLink) return;

        const error = validateSlug(newSlug);
        if (error) {
            setSlugError(error);
            return;
        }

        setIsLoading(true);
        try {
            await onEditLink(selectedLink.id, newLabel, newSlug);
            setIsEditOpen(false);
            setSelectedLink(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedLink) return;

        setIsLoading(true);
        try {
            await onDeleteLink(selectedLink.id);
            setIsDeleteOpen(false);
            setSelectedLink(null);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (link: BlinkLink) => {
        const url = generateBlinkUrl(link.slug);
        await navigator.clipboard.writeText(url);
        setCopiedId(link.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openEditDialog = (link: BlinkLink) => {
        setSelectedLink(link);
        setNewLabel(link.label);
        setNewSlug(link.slug);
        setSlugError(null);
        setIsEditOpen(true);
    };

    const openDeleteDialog = (link: BlinkLink) => {
        setSelectedLink(link);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display text-white">Your Blinks</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                        {links.length}/{maxLinks} links used
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setNewLabel("");
                        setNewSlug("");
                        setSlugError(null);
                        setIsCreateOpen(true);
                    }}
                    disabled={!canCreateMore || !stealthPublicKey}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Blink
                </Button>
            </div>

            {/* Links Grid */}
            {links.length === 0 ? (
                <EmptyState
                    icon={<Link2 className="w-8 h-8 text-zinc-500" />}
                    title="No Blinks Yet"
                    description="Create your first payment link to start receiving private payments."
                    action={
                        <Button
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                            disabled={!stealthPublicKey}
                        >
                            Create First Blink
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {links.map((link, index) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <LinkCardNew
                                    link={link}
                                    isCopied={copiedId === link.id}
                                    onCopy={() => copyToClipboard(link)}
                                    onEdit={() => openEditDialog(link)}
                                    onDelete={() => openDeleteDialog(link)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Card */}
                    {canCreateMore && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsCreateOpen(true)}
                            disabled={!stealthPublicKey}
                            className="h-[180px] rounded-2xl bg-white/5 border border-dashed border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 group-hover:bg-neon-pink/10 transition-all duration-300">
                                <Plus className="w-6 h-6 text-zinc-500 group-hover:text-neon-pink" />
                            </div>
                            <span className="font-medium text-zinc-500 group-hover:text-white transition-colors">
                                Add New Blink
                            </span>
                        </motion.button>
                    )}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Blink</DialogTitle>
                        <DialogDescription>
                            Create a custom payment link that anyone can use to send you SOL privately.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            label="Label"
                            placeholder="e.g., Coffee Tips, Freelance Work"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Custom Slug (Optional)</label>
                            <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/50 focus-within:ring-2 focus-within:ring-neon-pink/50 focus-within:border-neon-pink/50 transition-all duration-200">
                                <div className="px-4 py-3 text-zinc-500 bg-white/5 border-r border-white/5 text-sm font-mono whitespace-nowrap rounded-l-xl">
                                    nudge.app/
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-zinc-600 px-4 py-2 text-base font-medium"
                                    placeholder="coffee-fund"
                                    value={newSlug}
                                    onChange={(e) => {
                                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                                        setSlugError(null);
                                    }}
                                />
                            </div>
                            {slugError && <p className="text-sm text-red-400">{slugError}</p>}
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-800/50 border border-white/5">
                            <p className="text-xs text-zinc-500 mb-1">Preview URL</p>
                            <p className="text-sm text-zinc-300 font-mono break-all">
                                {hostUrl}/api/actions/nudge?id={newSlug || "your-slug"}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            disabled={isLoading || !newLabel || !newSlug}
                        >
                            {isLoading ? "Creating..." : "Create Blink"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Blink</DialogTitle>
                        <DialogDescription>
                            Update your payment link details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            label="Label"
                            placeholder="e.g., Coffee Tips"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Custom Slug (Optional)</label>
                            <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/50 focus-within:ring-2 focus-within:ring-neon-pink/50 focus-within:border-neon-pink/50 transition-all duration-200">
                                <div className="px-4 py-3 text-zinc-500 bg-white/5 border-r border-white/5 text-sm font-mono whitespace-nowrap rounded-l-xl">
                                    nudge.app/
                                </div>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-zinc-600 px-4 py-2 text-base font-medium"
                                    placeholder="coffee-fund"
                                    value={newSlug}
                                    onChange={(e) => {
                                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                                        setSlugError(null);
                                    }}
                                />
                            </div>
                            {slugError && <p className="text-sm text-red-400">{slugError}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleEdit}
                            disabled={isLoading || !newLabel || !newSlug}
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Blink
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedLink?.label}"?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLink?.pendingBalance && selectedLink.pendingBalance > 0 && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-red-400 font-medium">Pending Balance Warning</p>
                                    <p className="text-sm text-zinc-400 mt-1">
                                        This link has {selectedLink.pendingBalance} SOL in pending balance.
                                        Please withdraw before deleting.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDelete}
                            disabled={isLoading || (selectedLink?.pendingBalance ?? 0) > 0}
                            className="bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
                        >
                            {isLoading ? "Deleting..." : "Delete Blink"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Individual Link Card Component
function LinkCardNew({
    link,
    isCopied,
    onCopy,
    onEdit,
    onDelete
}: {
    link: BlinkLink;
    isCopied: boolean;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [showActions, setShowActions] = useState(false);

    return (
        <Card
            variant="gradient"
            className="relative group"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Status indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    link.isActive ? "bg-emerald-500" : "bg-zinc-500"
                )} />
            </div>

            {/* Content */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-display text-white mb-1">{link.label}</h3>
                    <p className="text-sm text-zinc-500 font-mono">/{link.slug}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-zinc-500">Clicks</span>
                        <p className="text-white font-medium">{link.clicks}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Received</span>
                        <p className="text-white font-medium">{link.totalReceived.toFixed(2)} SOL</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCopy}
                        className="flex-1 flex items-center justify-center gap-2"
                    >
                        {isCopied ? (
                            <>
                                <Check size={14} className="text-emerald-400" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                Copy URL
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onEdit}
                        className="px-3"
                    >
                        <Edit3 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="px-3 hover:text-red-400"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
