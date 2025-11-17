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
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  terms: z.boolean().optional(),
});

const signUpSchema = formSchema.extend({
    name: z.string().min(1, 'Name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    terms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms and conditions.' }),
    }),
});

type LoginFormValues = z.infer<typeof formSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;


async function createRazorpayContact(userId: string, phoneNumber?: string, email?: string | null, name?: string | null) {
  try {
    const payload: { userId: string; contact?: string, email?: string, name?: string } = { userId };
    if (phoneNumber) payload.contact = phoneNumber;
    if (email) payload.email = email;
    if (name) payload.name = name;

    const resp = await fetch(
      "https://nwxgjyamiborsgfnzqcj.supabase.co/functions/v1/create-razorpay-contact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(`Razorpay contact creation failed: ${errorData.error || resp.statusText}`);
    }

    const data = await resp.json();
    console.log("Razorpay contact created/fetched:", data);
  } catch (error) {
    console.error("Error calling Razorpay contact function:", error);
    // We don't re-throw or show a toast here to avoid blocking the login flow
    // for a non-critical operation.
  }
}

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
  
  // This effect will re-validate the form when the user switches between sign-in and sign-up
  // This is important because the validation rules are different for each form
  const isSignUpRef = React.useRef(isSignUp);
  if (isSignUpRef.current !== isSignUp) {
    form.trigger();
    isSignUpRef.current = isSignUp;
  }

  const onSubmit = async (data: LoginFormValues | SignUpFormValues) => {
    const auth = getAuth(app);
    try {
      let user: User;
      if (isSignUp) {
        // We can safely cast here because the form is validated with signUpSchema
        const signUpData = data as SignUpFormValues;

        const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
        user = userCredential.user;

        await updateProfile(user, {
          displayName: signUpData.name
        });

        // Generate a unique address
        const uniqueAddress = `ORA${user.uid.substring(0, 8).toUpperCase()}`;
        const userRef = doc(firestore, 'users', user.uid);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: signUpData.name,
          phoneNumber: signUpData.phoneNumber,
          photoURL: user.photoURL,
          balance: 0,
          oraBalance: 100, // Starting bonus
          address: uniqueAddress,
          bankDetails: null,
        };
        
        // Create user document in Firestore
        setDoc(userRef, userData, { merge: true }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          } satisfies SecurityRuleContext);
  
          errorEmitter.emit('permission-error', permissionError);
        });
        
        // Create Razorpay contact on signup
        await createRazorpayContact(user.uid, signUpData.phoneNumber, user.email, user.displayName);

        toast({
          title: 'Account Created',
          description: 'You have been successfully signed up.',
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        user = userCredential.user;
        // Create/update Razorpay contact on login
        await createRazorpayContact(user.uid, data.phoneNumber, user.email, user.displayName);
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
                        <Input placeholder="+91 XXXXX XXXXX" {...field} />
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
