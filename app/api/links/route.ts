
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("blink_links")
        .select("*")
        .eq("user_id", userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, stealthPublicKey, label } = body;

        // Validate inputs
        if (!userId || !stealthPublicKey || !label) {
            return NextResponse.json(
                { error: "Missing required fields: userId, stealthPublicKey, label" },
                { status: 400 }
            );
        }

        const host = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";
        const blinkUrl = `${host}/api/actions/nudge?id=${encodeURIComponent(stealthPublicKey)}`;

        const { data, error } = await supabase
            .from("blink_links")
            .insert([{
                user_id: userId,
                stealth_public_key: stealthPublicKey,
                label,
                blink_url: blinkUrl
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to create link:", error);
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }
}
