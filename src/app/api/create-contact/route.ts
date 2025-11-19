
import { admin } from '@/firebase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, contact, email, name } = body;

    if (!userId || !contact || !name) {
      return Response.json({ error: 'userId, contact, and name are required' }, { status: 400 });
    }

    const supabaseUrl = 'https://nwxgjyamiborsgfnzqcj.supabase.co';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
        console.error('Supabase service role key is not set in environment variables.');
        return Response.json({ error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
    }

    // Call Supabase function to create Razorpay contact
    const res = await fetch(
      `${supabaseUrl}/functions/v1/create-razorpay-contact`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The service_role key has super admin rights and should be used for server-to-server calls.
          // It must be passed as the 'apikey' header, not 'Authorization'.
          "apikey": supabaseServiceRoleKey
        },
        body: JSON.stringify({ name, email, contact }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // Forward the error from the Supabase function
      console.error('Supabase function returned an error:', { status: res.status, data });
      return Response.json({ error: data.error || 'Failed to create Razorpay contact via Supabase function' }, { status: res.status });
    }

    // If contact is created successfully, update Firestore with the contact ID
    if (data.id) {
      const userRef = admin.firestore().collection('users').doc(userId);
      await userRef.update({
        razorpayContactId: data.id,
      });
      console.log(`Successfully updated user ${userId} with razorpayContactId ${data.id}`);
      return Response.json({ id: data.id, message: 'Contact created and user updated successfully.' }, { status: 200 });
    } else {
        console.error('Supabase function response did not include a contact ID.', data);
        return Response.json({ error: 'Failed to get contact ID from Supabase function.' }, { status: 500 });
    }

  } catch (e: any) {
    console.error("Error in /api/create-contact:", e);
    return Response.json({ error: e.message || 'An internal server error occurred' }, { status: 500 });
  }
}
