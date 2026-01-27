
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost" | "neon";
    size?: "sm" | "md" | "lg";
}

export function Button({
    className,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {

    const variants = {
        primary: "bg-neon-pink text-black border-2 border-neon-pink hover:bg-transparent hover:text-neon-pink",
        outline: "bg-transparent text-white border-2 border-white hover:border-neon-yellow hover:text-neon-yellow",
        ghost: "bg-transparent text-zinc-400 hover:text-white hover:underline underline-offset-4",
        neon: "bg-transparent text-neon-pink border border-neon-pink shadow-[0_0_10px_rgba(247,39,152,0.5)] hover:shadow-[0_0_20px_rgba(247,39,152,0.8)] hover:bg-neon-pink/10",
    };

    const sizes = {
        sm: "px-4 py-1 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg font-bold",
    };

    return (
        <button
            className={cn(
                "relative transition-all duration-300 ease-out font-display uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
