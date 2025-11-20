

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

    if (!userId || !name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: userId, name, email, phone" },
        { status: 400 }
      );
    }
    
    // 1. Create a new contact in Razorpay
    const contact = await razorpay.customers.create({
      name,
      email,
      contact: phone.startsWith('+91') ? phone : `+91${phone}`,
    });

    if (!contact || !contact.id) {
        throw new Error("Failed to create Razorpay contact.");
    }
    
    // 2. Create the user document in Firestore
    const userRef = admin.firestore().collection("users").doc(userId);
    const uniqueAddress = `ORA${userId.substring(0, 8).toUpperCase()}`;
    const userData = {
        uid: userId,
        email: email,
        displayName: name,
        phoneNumber: phone.startsWith('+91') ? phone : `+91${phone}`,
        photoURL: '', // Initially empty
        balance: 0,
        oraBalance: 100, // Starting bonus
        address: uniqueAddress,
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        ifscCode: "",
        razorpayContactId: contact.id, // Add the razorpay contact ID
    };

    await userRef.set(userData);

    console.log(`Successfully created user ${userId} and Razorpay contact ${contact.id}.`);

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    });

  } catch (err: any) {
    console.error("Error in /api/create-contact:", err);
    // In case of Razorpay error, the message might be in err.error.description
    const errorMessage = err.error?.description || err.message || "An internal server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

