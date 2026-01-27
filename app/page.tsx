"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { deriveStealthKey, truncateAddress } from "@/lib/stealth";
import {
  getShieldedBalance,
  buildUnshieldTx,
  checkRpcHealth,
  checkIndexerHealth,
  NudgeError
} from "@/lib/light";
import { PublicKey } from "@solana/web3.js";
import {
  Copy,
  Shield,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Info,
  FileJson,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";

// Status message type for different states
type StatusType = "info" | "success" | "error" | "loading";

interface StatusMessage {
  text: string;
  type: StatusType;
}

export default function Home() {
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // -- State --
  const [stealthKeys, setStealthKeys] = useState<{ publicKey: PublicKey; secretKey: Uint8Array } | null>(null);
  const [blinkUrl, setBlinkUrl] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [networkHealthy, setNetworkHealthy] = useState<boolean | null>(null);

  // -- Helper: Set status with auto-clear for non-errors --
  const showStatus = useCallback((text: string, type: StatusType, autoClear = true) => {
    setStatus({ text, type });
    if (autoClear && type !== "error" && type !== "loading") {
      setTimeout(() => setStatus(null), 4000);
    }
  }, []);

  // -- Helper: Clear status --
  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  // -- Helper: Handle errors with user-friendly messages --
  const handleError = useCallback((error: unknown, fallbackMessage: string) => {
    console.error("Nudge Error:", error);

    if (error instanceof NudgeError) {
      showStatus(error.userMessage, "error", false);
    } else if (error instanceof Error) {
      // Check for common wallet errors
      if (error.message.includes("rejected") || error.message.includes("cancelled")) {
        showStatus("Transaction cancelled by user.", "info");
      } else if (error.message.includes("insufficient")) {
        showStatus("Insufficient SOL balance for transaction fees.", "error", false);
      } else {
        showStatus(fallbackMessage, "error", false);
      }
    } else {
      showStatus(fallbackMessage, "error", false);
    }
  }, [showStatus]);

  // -- Network Health Check --
  const checkNetworkHealth = useCallback(async () => {
    try {
      const [rpcOk, indexerOk] = await Promise.all([
        checkRpcHealth(),
        checkIndexerHealth()
      ]);
      setNetworkHealthy(rpcOk && indexerOk);
      return rpcOk && indexerOk;
    } catch {
      setNetworkHealthy(false);
      return false;
    }
  }, []);

  // Check network health on mount
  useEffect(() => {
    checkNetworkHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkNetworkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkNetworkHealth]);

  // -- Helper: Refresh Balance --
  const refreshBalance = useCallback(async (sKey: PublicKey) => {
    try {
      showStatus("Scanning Light Protocol State Tree...", "loading");
      const bal = await getShieldedBalance(sKey);
      setBalance(bal);
      if (bal > 0) {
        showStatus(`Found ${bal.toFixed(4)} SOL in shielded balance!`, "success");
      } else {
        showStatus("No shielded funds found yet. Share your Blink URL to receive payments.", "info");
      }
    } catch (error) {
      handleError(error, "Failed to fetch shielded balance. Please try again.");
    }
  }, [showStatus, handleError]);

  // -- 1. Identity Derivation --
  const handleCreateIdentity = async () => {
    if (!publicKey || !signMessage) return;

    setIsLoading(true);
    clearStatus();

    try {
      // First, check network health
      showStatus("Checking network connectivity...", "loading");
      const healthy = await checkNetworkHealth();

      if (!healthy) {
        showStatus("Network connection issues detected. Please check your internet and try again.", "error", false);
        setIsLoading(false);
        return;
      }

      showStatus("Please sign the message in your wallet to derive your stealth keys...", "loading");

      const messageContent = "Sign to access Nudge Stealth Account";
      const message = new TextEncoder().encode(messageContent);
      const signature = await signMessage(message);

      showStatus("Deriving stealth keypair...", "loading");
      const keys = await deriveStealthKey(signature);
      setStealthKeys(keys);

      const sId = keys.publicKey.toBase58();

      // Construct URL
      const host = window.location.origin;
      const url = `${host}/api/actions/nudge?id=${sId}`;
      setBlinkUrl(url);

      showStatus("Stealth identity created! Checking for existing funds...", "loading");

      // Fetch initial balance
      await refreshBalance(keys.publicKey);

    } catch (error) {
      if (error instanceof Error && error.message.includes("rejected")) {
        showStatus("Signature request was rejected. Please try again.", "info");
      } else {
        handleError(error, "Failed to create stealth identity. Please try again.");
      }
    }
    setIsLoading(false);
  };

  // -- 2. Real Withdrawal Logic --
  const handleWithdraw = async () => {
    if (!stealthKeys || !publicKey) return;

    setIsLoading(true);
    clearStatus();

    try {
      // Check network health first
      showStatus("Verifying network connection...", "loading");
      const healthy = await checkNetworkHealth();

      if (!healthy) {
        showStatus("Network issues detected. Please wait and try again.", "error", false);
        setIsLoading(false);
        return;
      }

      showStatus("Building ZK decompression transaction... This may take up to 60 seconds.", "loading");

      // Build the transaction (includes real ZK proof generation)
      const { transaction } = await buildUnshieldTx(stealthKeys, publicKey);

      showStatus("ZK proof generated! Please approve the transaction in your wallet...", "loading");

      // Send to Wallet Adapter
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed"
      });

      showStatus("Transaction sent! Waiting for confirmation...", "loading");

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      showStatus(`Success! Funds withdrawn to ${truncateAddress(publicKey.toBase58())}`, "success");

      // Update UI
      setBalance(0);

    } catch (error) {
      handleError(error, "Withdrawal failed. Please check the console for details.");
    }
    setIsLoading(false);
  };

  // -- 3. Compliance Export --
  const handleExportCompliance = () => {
    if (!stealthKeys) return;

    const data = {
      app: "Nudge | Privacy Payments on Solana",
      version: "1.0.0",
      network: "devnet",
      stealth_public_key: stealthKeys.publicKey.toBase58(),
      current_balance_sol: balance,
      timestamp: new Date().toISOString(),
      note: "Non-Custodial ZK Stealth Address - Compliance Export",
      disclaimer: "This export proves ownership of the stealth address for tax/compliance purposes."
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nudge-compliance-${truncateAddress(stealthKeys.publicKey.toBase58())}-${Date.now()}.json`;
    a.click();

    showStatus("Compliance data exported successfully!", "success");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(blinkUrl);
    showStatus("Blink URL copied to clipboard!", "success");
  };

  // Status icon based on type
  const StatusIcon = () => {
    if (!status) return null;
    switch (status.type) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Status color based on type
  const getStatusColor = () => {
    if (!status) return "";
    switch (status.type) {
      case "loading":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "success":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "error":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full space-y-8 z-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 mb-2 shadow-xl shadow-black/50">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-white drop-shadow-sm">
            Nudge <span className="text-base font-normal text-emerald-500 align-top bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Testnet</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
            Real ZK Privacy on Solana Devnet.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="transform hover:scale-105 transition-transform duration-200">
            <WalletMultiButton />
          </div>

          {/* Network Health Indicator */}
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className={`w-2 h-2 rounded-full ${networkHealthy === null
                ? "bg-zinc-500 animate-pulse"
                : networkHealthy
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`} />
            <span>
              {networkHealthy === null
                ? "Checking network..."
                : networkHealthy
                  ? "Devnet + Light Protocol Connected"
                  : "Network issues detected"}
            </span>
          </div>
        </div>

        {!publicKey ? (
          <div className="text-center p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
            <p className="text-zinc-500">Connect wallet to begin.</p>
          </div>
        ) : (
          <div className="space-y-6 bg-zinc-900/80 p-6 md:p-8 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-md">

            {!stealthKeys ? (
              <div className="text-center space-y-6 py-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">Initialize Stealth Identity</h3>
                  <p className="text-sm text-zinc-400 px-4">
                    Sign a message to load your hidden account keys.
                  </p>
                </div>
                <button
                  onClick={handleCreateIdentity}
                  disabled={isLoading}
                  className="bg-zinc-100 text-black px-8 py-3 rounded-xl font-semibold hover:bg-white flex items-center gap-2 mx-auto"
                >
                  {isLoading ? "Deriving..." : (
                    <>Create Identity <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Balance Card with Refresh */}
                  <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 relative overflow-hidden group">
                    <button
                      onClick={() => refreshBalance(stealthKeys.publicKey)}
                      className="absolute top-3 right-3 p-2 text-zinc-600 hover:text-white transition-colors z-20"
                      title="Refresh Balance"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Stealth Balance
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 font-mono">
                      {balance.toFixed(4)} SOL
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> On-Chain ZK Compressed
                    </div>
                  </div>

                  <div className="p-5 bg-black/40 rounded-2xl border border-zinc-800/50 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Stealth ID
                    </div>
                    <div className="text-xl font-mono text-zinc-300 break-all">
                      {truncateAddress(stealthKeys.publicKey.toBase58())}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Your Private Blink URL</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={blinkUrl}
                      className="w-full bg-black/60 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-zinc-800 px-4 py-2 rounded-lg text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 space-y-4">
                  <button
                    onClick={handleWithdraw}
                    disabled={balance <= 0 || isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Processing On-Chain..." : "Unshield & Withdraw"}
                  </button>

                  {status && (
                    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                      <StatusIcon />
                      <span>{status.text}</span>
                      {status.type === "error" && (
                        <button
                          onClick={clearStatus}
                          className="ml-2 text-xs opacity-60 hover:opacity-100"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleExportCompliance}
                      className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300"
                    >
                      <FileJson className="w-3 h-3" />
                      Export Real History
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}