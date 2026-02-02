"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Link as LinkInterface, Transaction } from "@/lib/types";
import { ArrowLeft, ExternalLink, Trash2, TrendingUp, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { format } from "date-fns";

export default function LinkDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [link, setLink] = useState<LinkInterface | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const linkId = params.id as string; // Check if this comes from folder structure [id]

    useEffect(() => {
        if (user && linkId) loadData();
    }, [user, linkId]);

    const loadData = async () => {
        setLoading(true);
        // 1. Fetch Link
        const { data: linkData, error: linkError } = await supabase
            .from("links")
            .select("*")
            .eq("id", linkId)
            .single();

        if (linkError || !linkData) {
            console.error("Link not found");
            router.push("/dashboard/links");
            return;
        }

        // Expire links after 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (new Date(linkData.created_at) < oneWeekAgo) {
            await supabase.from("links").delete().eq("id", linkData.id);
            router.push("/dashboard/links");
            return;
        }
        setLink(linkData);

        // 2. Fetch Transactions (Mocking Data if DB is empty for demo)
        const { data: txData } = await supabase
            .from("transactions")
            .select("*")
            .eq("link_id", linkId)
            .order("timestamp", { ascending: true });

        if (txData && txData.length > 0) {
            setTransactions(txData);
        } else {
            // GENERATE MOCK DATA FOR VISUALIZATION
            const mockData = Array.from({ length: 7 }).map((_, i) => ({
                id: `tx-${i}`,
                link_id: linkId,
                amount: Math.random() * 2, // Random SOL amount
                sender: "Unknown",
                signature: "sig",
                timestamp: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
                status: "confirmed",
                is_withdrawn: false,
            })) as Transaction[];
            setTransactions(mockData);
        }
        setLoading(false);
    };

    if (loading) return <div className="p-12 text-center text-zinc-500">Loading Analytics...</div>;
    if (!link) return null;

    // Prepare Chart Data
    const chartData = transactions.map(tx => ({
        date: format(new Date(tx.timestamp), "MMM dd"),
        amount: tx.amount,
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-display text-white flex items-center gap-2">
                        {link.title}
                        <span className="text-sm font-sans font-normal text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-md">/{link.slug}</span>
                    </h1>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button
                        variant="outline"
                        className="text-zinc-400 border-white/5 bg-zinc-900 hover:text-white"
                        onClick={() => {
                            const host = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
                            const url = `${host}/${link.id}/${link.slug}`;
                            window.open(url, "_blank");
                        }}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Link
                    </Button>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-500/20 border-none">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm mb-1">Total Volume</p>
                    <h3 className="text-3xl font-display text-white">{transactions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)} SOL</h3>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm mb-1">Total Transactions</p>
                    <h3 className="text-3xl font-display text-white">{transactions.length}</h3>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <p className="text-zinc-500 text-sm mb-1">Average Donation</p>
                    <h3 className="text-3xl font-display text-white">
                        {(transactions.reduce((acc, curr) => acc + curr.amount, 0) / (transactions.length || 1)).toFixed(2)} SOL
                    </h3>
                </div>
            </div>

            {/* Analytics Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Graph 1: SOL vs Time (Line) */}
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-display text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-neon-pink" />
                            Volume Over Time
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} SOL`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#F72798' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#F72798"
                                    strokeWidth={3}
                                    dot={{ fill: '#F72798', strokeWidth: 0, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graph 2: Transactions vs Day (Bar) */}
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-display text-white flex items-center gap-2">
                            <Coins className="w-4 h-4 text-cyan-400" />
                            Daily Transactions
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}
