
import { admin } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, contact, email, name } = body;

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Use environment variables for sensitive keys
    const supabaseUrl = 'https://nwxgjyamiborsgfnzqcj.supabase.co';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
        console.error('Supabase service role key is not set in environment variables.');
        return Response.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    // Call Supabase function to create Razorpay contact
    const res = await fetch(
      `${supabaseUrl}/functions/v1/create-razorpay-contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The service_role key has super admin rights and should be used for server-to-server calls.
          "Authorization": `Bearer ${supabaseServiceRoleKey}`
        },
        body: JSON.stringify({ userId, contact, email, name }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // Forward the error from the Supabase function
      console.error('Supabase function error:', data);
      return Response.json({ error: data.error || 'Failed to create Razorpay contact' }, { status: res.status });
    }

    // If contact is created successfully, update Firestore with the contact ID
    if (data.id) {
      const userRef = admin.firestore().collection('users').doc(userId);
      await userRef.update({
        razorpayContactId: data.id,
      });
    }

    return Response.json(data, { status: res.status });
  } catch (e: any) {
    console.error("Error in /api/create-contact:", e);
    return Response.json({ error: e.message || 'An internal server error occurred' }, { status: 500 });
  }
}
