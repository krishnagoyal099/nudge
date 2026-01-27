
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
        const { userId, steathPublicKey, label } = body;

        const { data, error } = await supabase
            .from("blink_links")
            .insert([{
                user_id: userId,
                stealth_public_key: steathPublicKey,
                label,
                blink_url: `https://...` // Generate real URL logic here
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
    }
}
