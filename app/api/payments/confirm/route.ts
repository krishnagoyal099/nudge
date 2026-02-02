import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";
import { getStandardConnection } from "@/lib/light";

interface ConfirmPayload {
    linkId: string;
    amount: number;
    sender: string;
    signature: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as ConfirmPayload;
        const { linkId, amount, sender, signature } = body;

        if (!linkId || !sender || !signature || typeof amount !== "number") {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (amount <= 0) {
            return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
        }

        try {
            new PublicKey(sender);
        } catch {
            return NextResponse.json({ error: "Invalid sender address" }, { status: 400 });
        }

        const { data: link, error: linkError } = await supabase
            .from("links")
            .select("*")
            .eq("id", linkId)
            .single();

        if (linkError || !link) {
            return NextResponse.json({ error: "Link not found" }, { status: 404 });
        }

        if (!link.is_active) {
            return NextResponse.json({ error: "Link is inactive" }, { status: 400 });
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (new Date(link.created_at) < oneWeekAgo) {
            return NextResponse.json({ error: "Link expired" }, { status: 400 });
        }

        const { data: existing } = await supabase
            .from("transactions")
            .select("id")
            .eq("signature", signature)
            .single();

        if (existing) {
            return NextResponse.json({ ok: true, status: "duplicate" });
        }

        const connection = getStandardConnection();
        const tx = await connection.getTransaction(signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        });

        if (!tx || tx.meta?.err) {
            return NextResponse.json({ error: "Transaction not confirmed" }, { status: 400 });
        }

        const message = tx.transaction.message as unknown as {
            getAccountKeys?: () => { staticAccountKeys: PublicKey[] };
            accountKeys?: PublicKey[];
        };

        const accountKeys = typeof message.getAccountKeys === "function"
            ? message.getAccountKeys().staticAccountKeys
            : message.accountKeys || [];

        const senderInTx = accountKeys.some((key: PublicKey) => key.toBase58() === sender);
        if (!senderInTx) {
            return NextResponse.json({ error: "Sender does not match transaction" }, { status: 400 });
        }

        const { error: insertError } = await supabase.from("transactions").insert([
            {
                link_id: linkId,
                amount,
                sender,
                signature,
                status: "confirmed",
            },
        ]);

        if (insertError && !insertError.message.includes("duplicate")) {
            return NextResponse.json({ error: "Failed to log transaction" }, { status: 500 });
        }

        const currentTotal = Number(link.total_received || 0);
        const { error: updateError } = await supabase
            .from("links")
            .update({ total_received: currentTotal + amount })
            .eq("id", linkId);

        if (updateError) {
            return NextResponse.json({ error: "Failed to update link balance" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Confirm payment error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
