'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Firestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

async function createRazorpayContact(userId: string, phoneNumber: string, email: string | null, name: string) {
  try {
    const payload = { 
        name, 
        email, 
        contact: phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`,
    };

    const resp = await fetch("/api/create-rzp-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const responseData = await resp.json();

    if (!resp.ok) {
      console.error(`Razorpay contact creation failed via Supabase: ${responseData.error || resp.statusText}`);
      return null;
    } 
    
    console.log("Razorpay contact created via Supabase:", responseData);
    
    // If contact is created successfully, update Firestore with the contact ID
    if (responseData.id) {
        const adminApiResp = await fetch('/api/update-user-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, razorpayContactId: responseData.id })
        });
        if (!adminApiResp.ok) {
             const adminError = await adminApiResp.json();
             console.error(`Failed to update user with Razorpay contact ID: ${adminError.error}`);
        }
    }

    return responseData.id || null;

  } catch (error) {
    console.error("Error calling create-rzp-contact API:", error);
    return null;
  }
}

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  terms: z.boolean().optional(),
});

const signUpSchema = formSchema.extend({
    name: z.string().min(1, 'Name is required'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(10, 'Phone number must be at most 10 digits'),
    terms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms and conditions.' }),
    }),
});

type LoginFormValues = z.infer<typeof formSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function LoginPage() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<LoginFormValues | SignUpFormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phoneNumber: '',
      terms: false,
    },
  });
  
  const isSignUpRef = React.useRef(isSignUp);
  if (isSignUpRef.current !== isSignUp) {
    form.trigger();
    isSignUpRef.current = isSignUp;
  }

  const onSubmit = async (data: LoginFormValues | SignUpFormValues) => {
    const auth = getAuth(app);
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Database not available. Please try again later." });
        return;
    }
    try {
      let user: User;
      if (isSignUp) {
        const signUpData = data as SignUpFormValues;

        const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
        user = userCredential.user;

        await updateProfile(user, {
          displayName: signUpData.name
        });

        // This function now handles creating the contact and updating the user record.
        const razorpayContactId = await createRazorpayContact(user.uid, signUpData.phoneNumber, user.email, signUpData.name);

        const uniqueAddress = `ORA${user.uid.substring(0, 8).toUpperCase()}`;
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: signUpData.name,
          phoneNumber: `+91${signUpData.phoneNumber}`,
          photoURL: user.photoURL,
          balance: 0,
          oraBalance: 100,
          address: uniqueAddress,
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          ifscCode: "",
          payoutLastAmount: 0,
          payoutLastId: "",
          payoutStatus: "N/A",
          razorpayContactId: razorpayContactId || "",
          razorpayFundAccount: "",
        };
        
        // This will create the user document in Firestore.
        await setDoc(userRef, userData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          } satisfies SecurityRuleContext);
  
          errorEmitter.emit('permission-error', permissionError);
        });

        toast({
          title: 'Account Created',
          description: 'You have been successfully signed up.',
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        user = userCredential.user;

        // Check and create Razorpay Contact ID on login if it's missing
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && !userDoc.data().razorpayContactId) {
          toast({
            title: 'Finalizing Account',
            description: 'Please wait while we set up your payment details.',
          });
          const userData = userDoc.data();
          const phoneNumber = (userData.phoneNumber || '').replace('+91', '');
          const displayName = userData.displayName || 'N/A';
          const email = userData.email || null;

          if (phoneNumber && displayName !== 'N/A') {
             await createRazorpayContact(user.uid, phoneNumber, email, displayName);
          } else {
             console.warn(`Cannot create razorpay contact for user ${user.uid} due to missing phone number or display name.`);
          }
        }
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="font-bold text-2xl text-primary">
              ORA
            </div>
          </div>
          <CardTitle>{isSignUp ? 'Create an Account' : 'Welcome to ORA Wallet'}</CardTitle>

          <CardDescription>
            {isSignUp ? 'Enter your details to get started.' : 'Sign in to access your wallet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {isSignUp && (
                 <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">+91</span>
                          </div>
                          <Input type="tel" placeholder="98765 43210" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {isSignUp && (
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">
                                I agree to the{' '}
                                <Link href="https://docs.google.com/document/d/1qTpIzOMtd2q9kLBKRjGFewRBdeOTkO51e0AAUtGTuYk/edit?usp=drivesdk" target="_blank" className="underline hover:text-primary">
                                Terms and Conditions
                                </Link>
                                .
                            </FormLabel>
                            <FormMessage />
                        </div>
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)}>
                  Sign In
                </Button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
