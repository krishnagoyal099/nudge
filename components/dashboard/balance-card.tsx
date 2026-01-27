
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
    balance: number;
    onRefresh: () => void;
    onWithdraw: () => void;
    isLoading: boolean;
    className?: string;
}

export function BalanceCard({ balance, onRefresh, onWithdraw, isLoading, className }: BalanceCardProps) {
    return (
        <div className={cn("p-8 rounded-xl bg-zinc-900/50 border border-white/10 relative overflow-hidden group", className)}>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-pink/10 rounded-full blur-[80px] group-hover:bg-neon-pink/20 transition-all duration-500" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <span className="font-mono text-zinc-500 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
                        Shielded Balance
                    </span>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin text-neon-pink" : ""} />
                    </button>
                </div>

                <div className="py-6">
                    <div className="text-5xl md:text-6xl font-display text-white tracking-tight">
                        {balance.toFixed(4)} <span className="text-2xl text-zinc-600 font-light">SOL</span>
                    </div>
                    <div className="text-sm text-zinc-500 mt-2 font-mono">
                        ≈ ${(balance * 145).toFixed(2)} USD
                    </div>
                </div>

                <div>
                    <Button
                        variant="neon"
                        className="w-full justify-center"
                        onClick={onWithdraw}
                        disabled={balance <= 0 || isLoading}
                    >
                        {isLoading ? "Processing..." : "Unshield & Withdraw"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
