"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Coins, ArrowDownLeft, ArrowUpRight, History, Shield, CheckCircle, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShieldedBalance, buildUnshieldTx } from "@/lib/light";
import { generateOwnershipProof, OwnershipProof } from "@/lib/noir";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { deriveStealthKey } from "@/lib/stealth";
import { supabase } from "@/lib/supabase";
import nacl from "tweetnacl";

export default function PoolPage() {
    const { user } = useAuth();
    const { connection } = useConnection();
    const { publicKey, signMessage, signTransaction } = useWallet();
    const [shieldedBalance, setShieldedBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const [proof, setProof] = useState<OwnershipProof | null>(null);
    const [stealthKeypair, setStealthKeypair] = useState<{ publicKey: PublicKey; secretKey: Uint8Array } | null>(null);
    const [isUnshielding, setIsUnshielding] = useState(false);
    const [poolError, setPoolError] = useState<string | null>(null);
    const [logs, setLogs] = useState<Array<{ id: string; amount: number; status: string; timestamp: string; linkTitle: string; linkSlug: string }>>([]);

    useEffect(() => {
        if (user?.public_key) {
            fetchBalance();
            fetchLogs();
        }
    }, [user]);

    const ensureStealthKey = async () => {
        if (stealthKeypair) return stealthKeypair;
        if (!publicKey || !signMessage) {
            throw new Error("Wallet must be connected and support message signing.");
        }

        const message = new TextEncoder().encode("Sign to derive your Nudge stealth key.");
        const signature = await signMessage(message);
        const derived = await deriveStealthKey(signature);
        setStealthKeypair(derived);
        return derived;
    };

    const fetchBalance = async () => {
        if (!user?.public_key) return;
        setIsLoading(true);
        setPoolError(null);
        try {
            const keypair = await ensureStealthKey();
            const bal = await getShieldedBalance(keypair.publicKey);
            setShieldedBalance(bal);
        } catch (error) {
            console.error("Failed to fetch shielded balance:", error);
            setPoolError("Failed to load shielded balance. Please try again.");
            // Fallback to 0 for demo if RPC issues
            setShieldedBalance(0);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        if (!user?.public_key) return;
        try {
            const { data: links } = await supabase
                .from("links")
                .select("id,title,slug")
                .eq("owner_id", user.public_key);

            if (!links || links.length === 0) {
                setLogs([]);
                return;
            }

            const linkMap = new Map(links.map((link) => [link.id, link]));

            const { data: txs } = await supabase
                .from("transactions")
                .select("id,amount,status,timestamp,link_id")
                .in("link_id", links.map((link) => link.id))
                .order("timestamp", { ascending: false });

            const normalized = (txs || []).map((tx) => {
                const link = linkMap.get(tx.link_id);
                return {
                    id: tx.id,
                    amount: Number(tx.amount || 0),
                    status: tx.status || "confirmed",
                    timestamp: tx.timestamp,
                    linkTitle: link?.title || "Unknown Link",
                    linkSlug: link?.slug || "unknown",
                };
            });

            setLogs(normalized);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        }
    };

    const handleGenerateProof = async () => {
        if (!user?.public_key) return;
        setIsGeneratingProof(true);
        try {
            // In a real stealth flow, we'd use the stealth secret key.
            // For this integrated demo, we're proving ownership of the main identity's shielded state.
            const dummySecret = new Uint8Array(32).fill(1); // Placeholder for demo
            const result = await generateOwnershipProof(
                dummySecret,
                user.public_key,
                "Verify Pool Ownership"
            );
            setProof(result);
        } catch (error) {
            console.error("Proof generation failed:", error);
        } finally {
            setIsGeneratingProof(false);
        }
    };

    const handleUnshield = async () => {
        if (!publicKey || !signTransaction) return;
        setIsUnshielding(true);
        setPoolError(null);
        try {
            const keypair = await ensureStealthKey();
            const { transaction, stealthSigner, noirProof } = await buildUnshieldTx(keypair, publicKey, publicKey);
            
            console.log("Stealth signer:", keypair.publicKey.toBase58());
            console.log("Wallet:", publicKey.toBase58());
            console.log("Noir ownership proof:", {
                stealthPublicKey: noirProof.stealthPublicKey,
                timestamp: noirProof.timestamp,
                proofHash: Array.from(noirProof.proof.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('')
            });
            
            // Pre-sign with stealth authority, then wallet signs as fee payer
            transaction.sign([stealthSigner]);
            const walletSigned = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(walletSigned.serialize(), {
                skipPreflight: false,
                maxRetries: 3,
            });

            await connection.confirmTransaction(signature, "confirmed");
            await fetchBalance();
            await fetchLogs();
        } catch (error: any) {
            console.error("Unshield failed:", error);
            setPoolError(error?.userMessage || error?.message || "Unshield failed");
        } finally {
            setIsUnshielding(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display text-white">Shielded Pool</h1>
                    <p className="text-zinc-400">Privacy-preserving liquidity managed via Light Protocol ZK-Compression.</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
                    <Shield className="w-3 h-3" />
                    ZK-Layer Active
                </div>
            </header>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon-pink/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-pink/10 transition-all duration-1000" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div>
                        <p className="text-zinc-500 font-medium mb-2 flex items-center gap-2 uppercase text-[10px] tracking-widest">
                            <Coins className="w-4 h-4 text-neon-pink" />
                            Shielded Balance (Light Protocol)
                        </p>
                        <h2 className="text-7xl font-display text-white tracking-tight flex items-baseline gap-3">
                            {isLoading ? (
                                <Loader2 className="w-10 h-10 animate-spin text-zinc-800" />
                            ) : (
                                <>
                                    {shieldedBalance.toFixed(2)}
                                    <span className="text-2xl text-zinc-600 font-sans font-normal uppercase tracking-widest">SOL</span>
                                </>
                            )}
                        </h2>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Button
                            onClick={handleGenerateProof}
                            disabled={isGeneratingProof || shieldedBalance === 0.00}
                            className="h-14 px-8 font-display text-xl align-middle rounded-2xl bg-white text-black hover:bg-zinc-200 flex items-center gap-3 transition-transform active:scale-95"
                        >
                            {isGeneratingProof ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : proof ? (
                                <Sparkles className="w-5 h-5 text-neon-pink" />
                            ) : null}
                            {proof ? "Proof Active" : "Generate Noir ZK Proof"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleUnshield}
                            disabled={isUnshielding || shieldedBalance === 0}
                            className="h-12 rounded-xl border-white/10 text-white hover:bg-white/5 font-display text-xl uppercase tracking-widest"
                        >
                            {isUnshielding ? "Unshielding..." : "Unshield to Wallet"}
                        </Button>
                    </div>
                </div>
            </div>

            {poolError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{poolError}</span>
                </div>
            )}

            {/* ZK Proof Status */}
            {proof && (
                <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl border-dashed">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-1">Noir ZK-Ownership Proof Generated</h4>
                            <p className="text-zinc-500 text-sm font-mono break-all line-clamp-1">
                                Hash: {Buffer.from(proof.proof).toString('hex').slice(0, 64)}...
                            </p>
                            <div className="mt-3 flex gap-4">
                                <span className="text-[10px] uppercase font-bold text-green-500/60 tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Backend: Barretenberg
                                </span>
                                <span className="text-[10px] uppercase font-bold text-green-500/60 tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Circuit: v0.30.0
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-zinc-500" />
                        Privacy Logs
                    </h3>
                    <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                        Helius Devnet Indexer
                    </div>
                </div>

                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 backdrop-blur-sm">
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <div key={log.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-neon-pink/10 flex items-center justify-center text-neon-pink border border-neon-pink/10">
                                        <ArrowDownLeft className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white font-medium">Blink Shielding</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-mono">
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-zinc-300">
                                                {log.linkTitle}
                                            </span>
                                            <span className="text-[10px] text-zinc-600">/{log.linkSlug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-mono font-bold">+ {log.amount.toFixed(2)} SOL</p>
                                    <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest">{log.status}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center">
                            <Coins className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No shielded funds found.</p>
                            <p className="text-xs text-zinc-700 mt-1 max-w-xs mx-auto">Create a blink and receive payments to see them in your private pool.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
