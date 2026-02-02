"use client";

import { useAuth } from "@/contexts/auth-context";
import { Sidebar, MobileHeader } from "@/components/app/sidebar";
import { LoginDialog } from "@/components/app/login-dialog";
import { OnboardingDialog } from "@/components/app/onboarding-dialog";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading, user, isNewUser } = useAuth();

    // 1. Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
        );
    }

    // 2. Connect Wallet State (No User loaded at all & Not New User flow yet)
    // Actually, AuthContext determines `isNewUser` only after connection.
    // If !user and !isNewUser, it means either:
    // a) Wallet not connected
    // b) Wallet connected but checkUser() hasn't finished (handled by isLoading) or finished with no user found (sets isNewUser=true)

    const isWalletConnected = !!user || isNewUser || (typeof window !== 'undefined' && localStorage.getItem('walletName'));
    // ^ Weak check. Better: use wallet adapter hook, but we need it inside this component.
    // Accessing context inside Layout is fine as it's a child of AuthProvider.

    // Let's rely on content blocking.

    return (
        <div className="min-h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden font-body">
            {/* Dialogs will appear over everything */}
            <LoginDialog />
            <OnboardingDialog />

            {/* If not authenticated, we block the main content view OR show a "Connect Wallet" placeholder */}
            {!isAuthenticated ? (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    {/* If user is new or existing but not logged in, the Dialogs handle the inputs. 
                        But if NO WALLET is connected, we need a connect button.
                     */}

                    {!isNewUser && !user && (
                        <div className="text-center space-y-6">
                            <h1 className="text-4xl font-display text-white">Connect to Nudge</h1>
                            <p className="text-zinc-400">Access your private dashboard.</p>
                            <div className="flex justify-center transform scale-125">
                                <WalletMultiButton />
                            </div>
                        </div>
                    )}

                    {/* If Waiting for Pin (user exists), the LoginDialog is open, so background can be anything. */}
                    {/* If Onboarding (isNewUser), OnboardingDialog is open. */}
                </div>
            ) : (
                <>
                    {/* Authenticated Layout */}
                    <Sidebar />
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <MobileHeader />
                        <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                            {/* Background Gradients for Dashboard */}
                            <div className="absolute top-0 left-0 w-full h-[500px] bg-neon-pink/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
                            {children}
                        </main>
                    </div>
                </>
            )}
        </div>
    );
}
