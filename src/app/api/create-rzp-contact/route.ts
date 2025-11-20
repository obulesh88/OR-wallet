
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        return NextResponse.json({ error: "Supabase configuration is missing." }, { status: 500 });
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/create-razorpay-contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Supabase Edge Functions require the service_role key to be in the 'apikey' header for server-side calls.
          "apikey": supabaseServiceRoleKey,
          // The Authorization header is for user JWTs, not service keys.
          "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
        // Log the error from Supabase function for better debugging
        console.error("Supabase function returned an error:", data);
        return NextResponse.json({ error: data.error || `Supabase function failed with status ${res.status}` }, { status: res.status });
    }
    
    return NextResponse.json(data, { status: res.status });

  } catch (error: any) {
    console.error("Error in /api/create-rzp-contact:", error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
