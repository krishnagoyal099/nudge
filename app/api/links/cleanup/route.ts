import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { error } = await supabaseAdmin
            .from("links")
            .delete()
            .lt("created_at", oneWeekAgo.toISOString());

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Cleanup error:", err);
        return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }
}
