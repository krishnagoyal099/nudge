
export interface User {
    id: string; // Wallet public key or internal UUID
    public_key: string;
    display_name: string;
    pin_hash: string;
    created_at: string;
}

export interface Link {
    id: string; // UUID
    slug: string;
    owner_id: string; // User public key or UUID
    stealth_public_key?: string;
    title: string;
    is_active: boolean;
    total_received: number; // in SOL
    created_at: string;
}

export interface Transaction {
    id: string;
    link_id: string;
    amount: number; // SOL
    sender: string; // public key or "Unknown"
    signature: string;
    timestamp: string;
    status: 'confirmed' | 'pending' | 'failed';
    is_withdrawn: boolean;
}

export interface PoolBalance {
    total_balance: number;
    available_to_withdraw: number;
}
