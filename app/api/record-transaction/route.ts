import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase.from("transactions").insert([body]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Transaction recorded", data });
}
