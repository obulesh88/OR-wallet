

import { NextResponse } from "next/server";
import { admin } from "@/firebase/admin";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId, name, email, phone } = await req.json();

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId, name, email" },
        { status: 400 }
      );
    }
    
    let contact;
    try {
      contact = await razorpay.customers.create({
        name,
        email,
        contact: phone.startsWith('+91') ? phone : `+91${phone}`,
      });
    } catch (razorpayError: any) {
      console.error("Razorpay contact creation failed:", razorpayError);
      // Still proceed to create the user in Firestore, but log the error.
      // The razorpayContactId will be missing, and can be backfilled later.
    }

    // This part is now handled on the client, but we'll leave the contact creation part
    // and just update the existing user doc with the contact id.

    const userRef = admin.firestore().collection("users").doc(userId);
    await userRef.set({
      razorpayContactId: contact?.id || "",
    }, { merge: true });

    console.log(`Successfully updated user ${userId} with Razorpay contact ID: ${contact?.id || 'N/A'}`);

    return NextResponse.json({
      success: true,
      contactId: contact?.id || null,
    });

  } catch (err: any) {
    console.error("Error in /api/create-contact:", err);
    const errorMessage = err.message || "An internal server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
