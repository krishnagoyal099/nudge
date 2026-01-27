
"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { deriveStealthKey, truncateAddress } from "@/lib/stealth";
import { getShieldedBalance, buildUnshieldTx, checkRpcHealth, checkIndexerHealth, NudgeError } from "@/lib/light";
import { PublicKey } from "@solana/web3.js";
import { Shield, Plus, Wallet, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { LinkCard } from "@/components/dashboard/link-card";
import { useUser } from "@/contexts/user-context";

export default function DashboardPage() {
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { user } = useUser();

  // -- State --
  const [stealthKeys, setStealthKeys] = useState<{ publicKey: PublicKey; secretKey: Uint8Array } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // -- Mock Data for Links (Replace with Supabase later) --
  const mockLinks = [
    { id: 1, label: "Coffee Fund", url: "https://dial.to/...", clicks: 42, total: 2.5 },
    { id: 2, label: "Freelance", url: "https://dial.to/...", clicks: 12, total: 10.0 },
  ];

  // -- Helpers --
  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 4000);
  };

  const handleError = (error: any) => {
    console.error(error);
    showStatus(error.message || "An error occurred");
  };

  const refreshBalance = useCallback(async () => {
    if (!stealthKeys) return;
    try {
      setIsLoading(true);
      const bal = await getShieldedBalance(stealthKeys.publicKey);
      setBalance(bal);
      showStatus("Balance updated");
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  }, [stealthKeys]);

  // -- Actions --
  const handleUnlockIdentity = async () => {
    if (!publicKey || !signMessage) return;
    try {
      setIsLoading(true);
      const msg = new TextEncoder().encode("Sign to access Nudge Stealth Account");
      const sig = await signMessage(msg);
      const keys = await deriveStealthKey(sig);
      setStealthKeys(keys);
      // Auto-fetch balance
      const bal = await getShieldedBalance(keys.publicKey);
      setBalance(bal);
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!stealthKeys || !publicKey) return;
    try {
      setIsLoading(true);
      showStatus("Generating ZK Proof...");
      const { transaction } = await buildUnshieldTx(stealthKeys, publicKey);

      showStatus("Please confirm transaction...");
      const sig = await sendTransaction(transaction, connection);

      showStatus("Transaction sent! Waiting for confirmation...");
      await connection.confirmTransaction(sig);

      showStatus("Success! Funds withdrawn.");
      refreshBalance();
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
        <div className="p-6 rounded-full bg-white/5 border border-white/10">
          <Wallet size={48} className="text-zinc-500" />
        </div>
        <h2 className="text-2xl font-display text-white">Connect Wallet to View Dashboard</h2>
        <p className="text-zinc-400 max-w-md">Access your private dashboard by connecting your Solana wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">
            Dashboard <span className="text-neon-pink">.</span>
          </h1>
          <p className="text-zinc-400 mt-1 font-mono text-sm">
            Welcome back, {user?.display_name || truncateAddress(publicKey.toBase58())}
          </p>
        </div>
        <div className="flex gap-4">
          {!stealthKeys && (
            <Button variant="outline" onClick={handleUnlockIdentity} disabled={isLoading}>
              {isLoading ? "Unlocking..." : "Unlock Stealth Mode"}
            </Button>
          )}
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} /> New Blink
          </Button>
        </div>
      </div>

      {status && (
        <div className="p-4 bg-neon-pink/10 border border-neon-pink/20 rounded-lg flex items-center gap-3 text-neon-pink animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{status}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Stats & Balance */}
        <div className="lg:col-span-2 space-y-8">
          {stealthKeys ? (
            <BalanceCard
              balance={balance}
              onRefresh={refreshBalance}
              onWithdraw={handleWithdraw}
              isLoading={isLoading}
            />
          ) : (
            <div className="p-10 rounded-xl bg-zinc-900/30 border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-4">
              <Shield size={48} className="text-zinc-600 mb-2" />
              <h3 className="text-xl font-display text-white">Stealth Identity Locked</h3>
              <p className="text-zinc-500 max-w-sm">
                Sign a message to derive your stealth keys and view your shielded balance without revealing your main wallet.
              </p>
              <Button onClick={handleUnlockIdentity} variant="outline" className="mt-4">
                Unlock Identity
              </Button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-white">Active Blinks</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLinks.map(link => (
                <LinkCard
                  key={link.id}
                  label={link.label}
                  url={link.url}
                  clicks={link.clicks}
                  totalReceived={link.total}
                  onCopy={(e) => { e.stopPropagation(); showStatus("Copied!"); }}
                  onClick={() => { }}
                />
              ))}
              {/* New Link Placeholder */}
              <button className="h-full min-h-[180px] rounded-xl bg-white/5 border border-white/5 border-dashed hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 group">
                <div className="p-3 rounded-full bg-white/5 group-hover:scale-110 transition-transform">
                  <Plus className="text-zinc-400 group-hover:text-white" />
                </div>
                <span className="font-display text-zinc-500 group-hover:text-white">Create New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions / Tips */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-neon-yellow/10 border border-neon-yellow/20">
            <h3 className="font-display text-neon-yellow text-lg mb-2">Beta Access</h3>
            <p className="text-sm text-zinc-300 mb-4">You are on the Free Tier which includes 15 blinks per month.</p>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-neon-yellow w-[15%]" />
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono">2/15 Used</p>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="p-6 rounded-xl bg-zinc-900/30 border border-white/5">
            <h3 className="font-display text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink text-xs">
                    <ArrowRight size={12} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Received 0.5 SOL</p>
                    <p className="text-xs text-zinc-500">2 mins ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}