
import { Copy, MoreHorizontal, ExternalLink, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
    label: string;
    url: string;
    clicks?: number;
    totalReceived?: number;
    isActive?: boolean;
    onCopy: (e: React.MouseEvent) => void;
    onClick: () => void;
}

export function LinkCard({ label, url, clicks = 0, totalReceived = 0, isActive = true, onCopy, onClick }: LinkCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative p-6 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-neon-pink/50 hover:bg-zinc-900/80 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-neon-yellow shadow-[0_0_8px_rgba(235,244,0,0.5)]" : "bg-zinc-700")} />
                    <h3 className="font-display text-lg text-white group-hover:text-neon-pink transition-colors">{label}</h3>
                </div>
                <button className="text-zinc-600 hover:text-white transition-colors">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between group-hover:border-white/10 transition-colors">
                    <p className="font-mono text-xs text-zinc-400 truncate max-w-[180px]">{url}</p>
                    <button
                        onClick={onCopy}
                        className="text-zinc-500 hover:text-white transition-colors p-1"
                        title="Copy URL"
                    >
                        <Copy size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Total Volume</p>
                        <p className="font-display text-xl text-white">{totalReceived} SOL</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Views</p>
                        <p className="font-display text-xl text-white">{clicks}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
