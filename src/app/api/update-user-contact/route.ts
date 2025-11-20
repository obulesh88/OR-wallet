
import { admin } from '@/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, razorpayContactId } = await req.json();

    if (!userId || !razorpayContactId) {
      return NextResponse.json({ error: 'userId and razorpayContactId are required' }, { status: 400 });
    }

    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      razorpayContactId: razorpayContactId,
    });

    return NextResponse.json({ message: 'User updated successfully.' }, { status: 200 });

  } catch (e: any) {
    console.error("Error in /api/update-user-contact:", e);
    return NextResponse.json({ error: e.message || 'An internal server error occurred' }, { status: 500 });
  }
}
