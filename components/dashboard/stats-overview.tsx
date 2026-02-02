"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Card, StatCard } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    TrendingUp, 
    DollarSign, 
    Link2, 
    Users, 
    ArrowUpRight,
    ArrowDownRight,
    Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStat {
    date: string;
    amount: number;
    count: number;
}

interface LinkStat {
    id: string;
    label: string;
    clicks: number;
    received: number;
    percentage: number;
}

interface StatsOverviewProps {
    totalReceived: number;
    totalClicks: number;
    uniqueSenders: number;
    activeLinks: number;
    weeklyChange: number;
    paymentHistory: PaymentStat[];
    linkStats: LinkStat[];
}

const CHART_COLORS = {
    primary: "#F72798",
    secondary: "#00FFFF",
    tertiary: "#EBF400",
    quaternary: "#F57D1F",
};

const PIE_COLORS = [
    "#F72798",
    "#00FFFF", 
    "#EBF400",
    "#F57D1F",
    "#8B5CF6",
    "#10B981",
];

export function StatsOverview({
    totalReceived,
    totalClicks,
    uniqueSenders,
    activeLinks,
    weeklyChange,
    paymentHistory,
    linkStats,
}: StatsOverviewProps) {
    // Format currency
    const formatSOL = (value: number) => `${value.toFixed(2)} SOL`;
    
    // Calculate totals for pie chart
    const totalLinkReceived = useMemo(() => 
        linkStats.reduce((acc, stat) => acc + stat.received, 0), 
        [linkStats]
    );

    return (
        <div className="space-y-8">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <StatCard
                        title="Total Received"
                        value={formatSOL(totalReceived)}
                        icon={<DollarSign className="w-5 h-5 text-neon-pink" />}
                        trend={{ value: weeklyChange, positive: weeklyChange >= 0 }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatCard
                        title="Link Clicks"
                        value={totalClicks.toLocaleString()}
                        icon={<Link2 className="w-5 h-5 text-cyan-400" />}
                        subtitle="Across all blinks"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        title="Unique Senders"
                        value={uniqueSenders}
                        icon={<Users className="w-5 h-5 text-neon-yellow" />}
                        subtitle="Privacy preserved"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatCard
                        title="Active Links"
                        value={activeLinks}
                        icon={<Activity className="w-5 h-5 text-emerald-400" />}
                        subtitle="Ready to receive"
                    />
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Payment History */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2"
                >
                    <Card variant="gradient" padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-display text-white">Payment Activity</h3>
                                <p className="text-sm text-zinc-500">Last 30 days</p>
                            </div>
                            <Tabs defaultValue="amount" className="w-auto">
                                <TabsList>
                                    <TabsTrigger value="amount">Amount</TabsTrigger>
                                    <TabsTrigger value="count">Count</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={paymentHistory}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12 }}
                                        tickFormatter={(value) => `${value} SOL`}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'rgba(24, 24, 27, 0.95)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                        }}
                                        labelStyle={{ color: '#ffffff' }}
                                        itemStyle={{ color: '#a1a1aa' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke={CHART_COLORS.primary}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorAmount)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Link Performance Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card variant="gradient" padding="lg" className="h-full">
                        <div className="mb-6">
                            <h3 className="text-lg font-display text-white">Link Distribution</h3>
                            <p className="text-sm text-zinc-500">By received amount</p>
                        </div>
                        
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={linkStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="received"
                                    >
                                        {linkStats.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: 'rgba(24, 24, 27, 0.95)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                        }}
                                        formatter={(value) => [`${Number(value).toFixed(2)} SOL`, 'Received']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 space-y-2">
                            {linkStats.slice(0, 4).map((stat, index) => (
                                <div key={stat.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                        />
                                        <span className="text-zinc-400 truncate max-w-[100px]">
                                            {stat.label}
                                        </span>
                                    </div>
                                    <span className="text-white font-medium">
                                        {((stat.received / totalLinkReceived) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Link Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card variant="gradient" padding="lg">
                    <div className="mb-6">
                        <h3 className="text-lg font-display text-white">Link Performance</h3>
                        <p className="text-sm text-zinc-500">Detailed breakdown by link</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left text-sm font-medium text-zinc-500 pb-4">Link</th>
                                    <th className="text-right text-sm font-medium text-zinc-500 pb-4">Clicks</th>
                                    <th className="text-right text-sm font-medium text-zinc-500 pb-4">Received</th>
                                    <th className="text-right text-sm font-medium text-zinc-500 pb-4">Conv. Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {linkStats.map((stat, index) => (
                                    <tr 
                                        key={stat.id} 
                                        className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                />
                                                <span className="text-white font-medium">{stat.label}</span>
                                            </div>
                                        </td>
                                        <td className="text-right text-zinc-300 py-4">
                                            {stat.clicks.toLocaleString()}
                                        </td>
                                        <td className="text-right text-white font-medium py-4">
                                            {stat.received.toFixed(2)} SOL
                                        </td>
                                        <td className="text-right py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1 text-sm",
                                                stat.percentage > 5 ? "text-emerald-400" : "text-zinc-400"
                                            )}>
                                                {stat.percentage > 5 && <ArrowUpRight className="w-4 h-4" />}
                                                {stat.percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
