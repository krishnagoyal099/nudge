
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: string;
    wallet_address: string;
    display_name?: string;
    tier: "free" | "pro" | "enterprise";
}

interface UserContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    logout: () => { },
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { publicKey, disconnect } = useWallet();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Sync with Wallet Adapter
    useEffect(() => {
        async function syncUser() {
            if (!publicKey) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const address = publicKey.toBase58();

            try {
                // Check if user exists in Supabase
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("wallet_address", address)
                    .single();

                if (error && error.code !== "PGRST116") {
                    // PGRST116 = "Row not found" - this is expected for new users
                    console.error("Error fetching user:", error);
                    // Fallback to demo mode on DB errors
                    setUser({
                        id: "demo",
                        wallet_address: address,
                        tier: "free"
                    });
                    setIsLoading(false);
                    return;
                }

                if (data) {
                    setUser(data);
                } else {
                    // Create new user if not found (auto-signup)
                    const { data: newUser, error: createError } = await supabase
                        .from("users")
                        .insert([{ wallet_address: address, tier: "free" }])
                        .select()
                        .single();

                    if (createError) {
                        console.error("Error creating user:", createError);
                    }

                    if (newUser) {
                        setUser(newUser);
                    } else {
                        // Fallback for demo/no-db mode
                        setUser({
                            id: "demo",
                            wallet_address: address,
                            tier: "free"
                        });
                    }
                }
            } catch (err) {
                console.error("Unexpected error in user sync:", err);
                // Fallback to demo mode
                setUser({
                    id: "demo",
                    wallet_address: address,
                    tier: "free"
                });
            } finally {
                setIsLoading(false);
            }
        }

        syncUser();
    }, [publicKey]);

    const login = async () => {
        // Wallet adapter handles the distinct "connect" UI
        // This function is for manual triggers if needed
    };

    const logout = () => {
        disconnect();
        setUser(null);
        router.push("/");
    };

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
