"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "gradient" | "glow";
    padding?: "sm" | "md" | "lg" | "none";
    hover?: boolean;
}

export function Card({
    className,
    variant = "default",
    padding = "md",
    hover = true,
    children,
    ...props
}: CardProps) {
    const variants = {
        default: "bg-zinc-900/50 border border-white/5",
        glass: "bg-white/5 backdrop-blur-xl border border-white/10",
        gradient: "bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5",
        glow: "bg-zinc-900/50 border border-white/10 shadow-[0_0_30px_rgba(247,39,152,0.1)]",
    };

    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    return (
        <div
            className={cn(
                "rounded-2xl transition-all duration-300",
                variants[variant],
                paddings[padding],
                hover && "hover:border-white/20 hover:translate-y-[-2px]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: { value: number; positive: boolean };
    className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            {/* Subtle gradient background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon-pink/5 to-transparent blur-2xl" />
            
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm text-zinc-500 mb-1">{title}</p>
                    <p className="text-3xl font-display text-white">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn(
                            "inline-flex items-center gap-1 mt-2 text-sm",
                            trend.positive ? "text-emerald-400" : "text-red-400"
                        )}>
                            <span>{trend.positive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-zinc-500">vs last week</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="p-3 rounded-xl bg-white/5">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-display text-white mb-2">{title}</h3>
            <p className="text-zinc-400 max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
