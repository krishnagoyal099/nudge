"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Link as LinkInterface } from "@/lib/types";
import {
    Shield,
    Link2,
    Coins,
    ArrowRight,
    CheckCircle,
    Loader2,
    AlertCircle,
    Lock,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { buildShieldedTransferTx } from "@/lib/light";
import { useAuth } from "@/contexts/auth-context";

export default function PublicPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const {
        isAuthenticated,
        isLoading: authLoading,
        isNewUser,
        checkPin,
        register,
    } = useAuth();

    const [link, setLink] = useState<LinkInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [payStatus, setPayStatus] = useState<"idle" | "building" | "signing" | "confirming" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [pin, setPin] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSubmitting, setAuthSubmitting] = useState(false);

    const linkId = params.id as string;
    const slug = params.slug as string;

    useEffect(() => {
        if (linkId) fetchLink();
    }, [linkId]);

    const fetchLink = async () => {
        setLoading(true);
        try {
            await fetch("/api/links/cleanup", { method: "POST" });
            const { data, error: fetchError } = await supabase
                .from("links")
                .select("*")
                .eq("id", linkId)
                .single();

            if (fetchError || !data) {
                setError("Blink not found");
                return;
            }

            // Verify slug matches
            if (data.slug !== slug) {
                router.replace(`/${data.id}/${data.slug}`);
                return;
            }

            // Check expiration (7 days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            if (new Date(data.created_at) < oneWeekAgo) {
                setError("This Blink has expired");
                return;
            }

            if (!data.is_active) {
                setError("This Blink is inactive");
                return;
            }

            setLink(data);
        } catch (err) {
            console.error(err);
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!publicKey || !link || !amount) return;
        if (!isAuthenticated) {
            setPayStatus("error");
            setStatusMessage("Please unlock with your PIN to continue.");
            return;
        }
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid amount");
            return;
        }

        setPayStatus("building");
        setStatusMessage("Building ZK-Shielded transaction...");

        try {
            // Build the shielded transfer using Light Protocol
            if (!link.stealth_public_key) {
                throw new Error("Blink is missing a stealth destination.");
            }

            const transaction = await buildShieldedTransferTx(
                publicKey,
                link.stealth_public_key,
                val
            );

            setPayStatus("signing");
            setStatusMessage("Open your wallet to approve this payment");
            const signature = await sendTransaction(transaction, connection);

            setPayStatus("confirming");
            setStatusMessage("Confirming on Solana...");

            const confirmPromise = connection.confirmTransaction(signature, "confirmed");
            const timeoutPromise = new Promise<void>((_, reject) => {
                setTimeout(() => reject(new Error("Confirmation timed out. Please check your wallet or try again.")), 45000);
            });

            await Promise.race([confirmPromise, timeoutPromise]);

            const confirmResponse = await fetch("/api/payments/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    linkId: link.id,
                    amount: val,
                    sender: publicKey.toBase58(),
                    signature,
                }),
            });

            if (!confirmResponse.ok) {
                const payload = await confirmResponse.json().catch(() => ({}));
                throw new Error(payload?.error || "Failed to confirm payment");
            }

            setPayStatus("success");
            setStatusMessage("Transaction confirmed!");
        } catch (err: any) {
            console.error(err);
            setPayStatus("error");
            setStatusMessage(err.userMessage || err.message || "Payment failed");
        }
    };

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin) return;
        setAuthSubmitting(true);
        setAuthError(null);
        try {
            const ok = await checkPin(pin);
            if (!ok) setAuthError("Incorrect PIN");
        } catch (err) {
            setAuthError("Failed to verify PIN");
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        if (pin.length < 4) {
            setAuthError("PIN must be at least 4 digits");
            return;
        }
        if (pin !== confirmPin) {
            setAuthError("PINs do not match");
            return;
        }
        setAuthSubmitting(true);
        try {
            const ok = await register(displayName, pin);
            if (!ok) setAuthError("Registration failed");
        } catch {
            setAuthError("Registration failed");
        } finally {
            setAuthSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
                <Loader2 className="w-12 h-12 text-neon-pink animate-spin mb-4" />
                <p className="text-zinc-500 font-display uppercase tracking-widest text-sm">Initializing Secure Link...</p>
            </div>
        );
    }

    if (error || !link) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-display text-white mb-2">{error || "Link Unavailable"}</h1>
                <p className="text-zinc-500 max-w-sm mb-8">This payment link might have expired or doesn't exist.</p>
                <Button onClick={() => router.push("/")} variant="outline" className="border-white/10 text-white">
                    Return to Nudge
                </Button>
            </div>
        );
    }

    return (
        <>
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-neon-pink/10 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none translate-y-1/2" />

            {/* Logo Header */}
            <div className="mb-12 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="w-14 h-14 bg-gradient-to-br from-neon-pink to-neon-orange rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(247,39,152,0.3)]">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-sm font-display tracking-[0.4em] text-white/50 uppercase">Secured by Nudge</h2>
            </div>

            {/* Payment Card */}
            <main className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden relative">
                    {/* Glass Shine */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {payStatus === 'success' ? (
                        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-display mb-2">Payment Sent!</h2>
                            <p className="text-zinc-500 mb-10 leading-relaxed font-medium">Your donation has been privately compressed into the recipient's pool.</p>
                            <Button
                                onClick={() => router.push("/")}
                                className="w-full h-16 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Go to Nudge.app
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-3xl font-display mb-2 text-white">{link.title}</h1>
                                <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Private Stealth Link</span>
                                </div>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center">
                                        <Coins className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <p className="font-display text-zinc-300">Amount to send</p>
                                </div>
                                <div className="text-right">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-transparent border-none text-right font-mono text-3xl text-white placeholder:text-zinc-800 w-32 focus:ring-0"
                                    />
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mt-1">Solana (SOL)</p>
                                </div>
                            </div>

                            {publicKey && !isAuthenticated && (
                                <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="font-display text-zinc-200">Secure Access</p>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">PIN Required</span>
                                    </div>

                                    {authLoading ? (
                                        <div className="flex items-center justify-center py-4">
                                            <Loader2 className="w-5 h-5 text-neon-pink animate-spin" />
                                        </div>
                                    ) : isNewUser ? (
                                        <form onSubmit={handleRegister} className="space-y-3">
                                            <Input
                                                placeholder="Display name"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="bg-zinc-900/60 border-white/10 focus:border-neon-pink"
                                                required
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="password"
                                                    placeholder="PIN"
                                                    value={pin}
                                                    onChange={(e) => setPin(e.target.value)}
                                                    maxLength={6}
                                                    className="bg-zinc-900/60 border-white/10 focus:border-neon-pink text-center tracking-widest"
                                                    required
                                                />
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm"
                                                    value={confirmPin}
                                                    onChange={(e) => setConfirmPin(e.target.value)}
                                                    maxLength={6}
                                                    className="bg-zinc-900/60 border-white/10 focus:border-neon-pink text-center tracking-widest"
                                                    required
                                                />
                                            </div>
                                            {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                                            <Button
                                                type="submit"
                                                disabled={authSubmitting}
                                                className="w-full h-12 rounded-2xl bg-neon-pink text-white hover:bg-neon-pink/90"
                                            >
                                                {authSubmitting ? "Creating..." : "Create Account"}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleUnlock} className="space-y-3">
                                            <Input
                                                type="password"
                                                placeholder="Enter PIN"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                maxLength={6}
                                                className="bg-zinc-900/60 border-white/10 focus:border-neon-pink text-center tracking-widest"
                                                required
                                            />
                                            {authError && <p className="text-xs text-red-500 text-center">{authError}</p>}
                                            <Button
                                                type="submit"
                                                disabled={authSubmitting || pin.length < 4}
                                                className="w-full h-12 rounded-2xl bg-neon-pink text-white hover:bg-neon-pink/90"
                                            >
                                                {authSubmitting ? "Verifying..." : "Unlock"}
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {statusMessage && payStatus !== 'idle' && (
                                <div className={`p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest ${payStatus === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-neon-pink/10 text-neon-pink animate-pulse'}`}>
                                    {statusMessage}
                                </div>
                            )}

                            {!publicKey ? (
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Connect wallet to pay</p>
                                    <div className="transform scale-125">
                                        <WalletMultiButton />
                                    </div>
                                </div>
                            ) : isAuthenticated ? (
                                <Button
                                    onClick={handlePay}
                                    disabled={payStatus !== "idle" && payStatus !== "error" || !amount}
                                    className="w-full h-18 rounded-3xl bg-neon-pink hover:bg-white hover:text-neon-pink text-white font-display text-2xl tracking-[0.1em] transition-all shadow-[0_10px_30px_rgba(247,39,152,0.3)] active:scale-95 flex items-center justify-center gap-3 border-none"
                                >
                                    {["building", "signing", "confirming"].includes(payStatus) ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Send Nudge
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <div className="text-center text-xs uppercase tracking-widest text-zinc-500">
                                    Unlock with PIN to continue
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                                <span className="text-[10px] uppercase font-black tracking-tighter">Powered by</span>
                                <div className="h-4 w-px bg-white/20" />
                                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Light Protocol</span>
                                <div className="h-4 w-px bg-white/20" />
                                <span className="text-[10px] uppercase font-black tracking-[0.3em]">Helius</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Tag */}
            <footer className="mt-12 relative z-10">
                <p className="text-xs text-zinc-700 font-medium">Privacy is a human right. Protected by Nudge Protocol.</p>
            </footer>
        </div>
        {(payStatus === "signing" || payStatus === "confirming") && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-neon-pink animate-spin mx-auto" />
                    <h3 className="text-white font-display text-lg">Confirm in your wallet</h3>
                    <p className="text-zinc-400 text-sm">If the wallet window looks blank, please wait a few seconds or reopen your wallet extension.</p>
                </div>
            </div>
        )}
        </>
    );
}
