"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OnboardingDialog() {
    const { isNewUser, register, logout } = useAuth();
    const [step, setStep] = useState<"details" | "confirm">("details");
    const [displayName, setDisplayName] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isOpen = isNewUser;

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) {
            setError("PIN must be at least 4 digits");
            return;
        }
        setError("");
        setStep("confirm");
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        setLoading(true);
        try {
            const success = await register(displayName, pin);
            if (!success) {
                setError("Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center">Create Account</DialogTitle>
                    <DialogDescription className="text-center text-zinc-400">
                        Setup your secure identity on Nudge.
                    </DialogDescription>
                </DialogHeader>

                {step === "details" ? (
                    <form onSubmit={handleNext} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">Display Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Satoshi"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white focus:ring-neon-pink focus:border-neon-pink"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pin" className="text-zinc-300">Create PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                placeholder="••••••"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white focus:ring-neon-pink focus:border-neon-pink text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                            />
                            <p className="text-xs text-zinc-500">Used to encrypt your local session.</p>
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={logout} className="flex-1 text-zinc-400 hover:text-white">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-neon-pink hover:bg-neon-pink/80 text-white">
                                Next
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirmPin" className="text-zinc-300">Confirm PIN</Label>
                            <Input
                                id="confirmPin"
                                type="password"
                                placeholder="••••••"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white focus:ring-neon-pink focus:border-neon-pink text-center text-2xl tracking-widest"
                                maxLength={6}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setStep("details")} className="flex-1 text-zinc-400 hover:text-white">
                                Back
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1 bg-neon-pink hover:bg-neon-pink/80 text-white">
                                {loading ? "Creating..." : "Create Account"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
