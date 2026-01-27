import { NextRequest, NextResponse } from "next/server";
import {
    ActionGetResponse,
    ActionPostRequest,
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse
} from "@solana/actions";
import { PublicKey } from "@solana/web3.js";
import { buildShieldedTransferTx, NudgeError } from "@/lib/light";

/**
 * 1. GET HANDLER
 * Returns the "Metadata" to render the UI cards on X/Twitter/Dial.to
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const recipientId = searchParams.get("id"); // This is the Stealth Public Key

        if (!recipientId) {
            return NextResponse.json(
                { error: "Missing 'id' parameter in URL" },
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        // Validate the stealth ID is a valid public key
        try {
            new PublicKey(recipientId);
        } catch {
            return NextResponse.json(
                { error: "Invalid stealth address format" },
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        const host = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

        const payload: ActionGetResponse = {
            icon: `${host}/nudge-logo.png`,
            title: "Nudge: Private Transfer",
            description: `Send SOL privately. The recipient's main wallet remains hidden. Funds are ZK-shielded immediately using Light Protocol compression.`,
            label: "Nudge (Shielded)",
            links: {
                actions: [
                    {
                        type: "transaction",
                        label: "Send 0.1 SOL",
                        href: `/api/actions/nudge?id=${recipientId}&amount=0.1`,
                    },
                    {
                        type: "transaction",
                        label: "Send 0.5 SOL",
                        href: `/api/actions/nudge?id=${recipientId}&amount=0.5`,
                    },
                    {
                        type: "transaction",
                        label: "Send Custom Amount",
                        href: `/api/actions/nudge?id=${recipientId}&amount={amount}`,
                        parameters: [
                            {
                                name: "amount",
                                label: "Enter Amount (SOL)",
                                required: true
                            }
                        ]
                    }
                ]
            }
        };

        return NextResponse.json(payload, { headers: ACTIONS_CORS_HEADERS });

    } catch (err) {
        console.error("GET Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500, headers: ACTIONS_CORS_HEADERS }
        );
    }
}

/**
 * 2. OPTIONS HANDLER
 * Required for CORS (Cross-Origin Resource Sharing). 
 * Blinks won't work without this.
 */
export const OPTIONS = async () => {
    return new Response(null, { headers: ACTIONS_CORS_HEADERS });
};

/**
 * 3. POST HANDLER
 * Receives the sender's wallet address, builds the ZK transaction, and returns it.
 * This creates a REAL Light Protocol compression transaction.
 */
export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const recipientId = searchParams.get("id");
        const amountStr = searchParams.get("amount");

        // The body contains the sender's public key (account)
        const body: ActionPostRequest = await req.json();

        // -- VALIDATION --
        let senderAccount: PublicKey;
        try {
            senderAccount = new PublicKey(body.account);
        } catch (err) {
            return new Response(
                JSON.stringify({ error: "Invalid sender wallet address" }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        if (!recipientId) {
            return new Response(
                JSON.stringify({ error: "Missing recipient stealth ID" }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        if (!amountStr) {
            return new Response(
                JSON.stringify({ error: "Missing transfer amount" }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            return new Response(
                JSON.stringify({ error: "Amount must be a positive number" }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        if (amount < 0.001) {
            return new Response(
                JSON.stringify({ error: "Minimum transfer amount is 0.001 SOL" }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        // -- TRANSACTION BUILDING --
        // Build the REAL ZK-Compression transaction using Light Protocol
        console.log(`[Nudge Action] Building shielded transfer: ${amount} SOL to ${recipientId.slice(0, 8)}...`);

        const versionedTx = await buildShieldedTransferTx(senderAccount, recipientId, amount);

        console.log("[Nudge Action] Transaction built successfully!");

        // -- RESPONSE --
        const payload: ActionPostResponse = await createPostResponse({
            fields: {
                type: "transaction",
                transaction: versionedTx,
                message: `Sending ${amount} SOL privately via Nudge. Funds will be ZK-compressed.`,
            },
        });

        return NextResponse.json(payload, { headers: ACTIONS_CORS_HEADERS });

    } catch (err) {
        console.error("POST Error:", err);

        // Handle NudgeError with user-friendly message
        if (err instanceof NudgeError) {
            return new Response(
                JSON.stringify({ error: err.userMessage }),
                { status: 400, headers: ACTIONS_CORS_HEADERS }
            );
        }

        // Handle generic errors
        const message = err instanceof Error ? err.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: `Transaction failed: ${message}` }),
            { status: 500, headers: ACTIONS_CORS_HEADERS }
        );
    }
}