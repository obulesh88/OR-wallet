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
import { doc, setDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useFirebaseApp, useFirestore } from '@/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';


const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  terms: z.boolean().optional(),
});

const signUpSchema = formSchema.extend({
    name: z.string().min(1, 'Name is required'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(13, 'Phone number must be at most 13 digits (including country code)'),
    terms: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the terms and conditions.' }),
    }),
});

type LoginFormValues = z.infer<typeof formSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

function generateWalletAddress(userId: string) {
    return `OR${userId.substring(0, 8).toUpperCase()}`;
}

async function createNewUserDocument(
    firestore: Firestore, 
    user: User, 
    signUpData: SignUpFormValues
) {
    const userRef = doc(firestore, "users", user.uid);
    
    const newUser = {
        uid: user.uid,
        email: user.email,
        displayName: signUpData.name,
        phoneNumber: signUpData.phoneNumber.startsWith('+') ? signUpData.phoneNumber : `+91${signUpData.phoneNumber}`,
        photoURL: '',
        oraBalance: 0,
        balance: 0,
        address: generateWalletAddress(user.uid),
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
    };

    setDoc(userRef, newUser)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: newUser,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

export default function LoginPage() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    const auth = getAuth(app);
    if (!firestore) {
        toast({ variant: "destructive", title: "Error", description: "Database not available. Please try again later." });
        setIsSubmitting(false);
        return;
    }

    try {
      if (isSignUp) {
        const signUpData = data as SignUpFormValues;

        const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: signUpData.name
        });
        
        await createNewUserDocument(firestore, user, signUpData);

        toast({
          title: 'Account Created',
          description: 'You have been successfully signed up.',
        });
        router.push('/dashboard');
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
            <div className="hero-section text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Earn Real Money Daily with Simple Tasks</h1>
                <p className="subtitle max-w-2xl mx-auto text-lg text-muted-foreground">OR Wallet pays you for completing fun daily activities. Play games, answer surveys, watch videos, and earn instant cash that adds up every day.</p>
                
                <div className="stats grid grid-cols-3 gap-4 max-w-xl mx-auto my-8">
                    <div className="stat p-4 bg-muted rounded-lg">
                    <h3 className="text-2xl font-bold">50,000+</h3>
                    <p className="text-sm text-muted-foreground">Active Earners</p>
                    </div>
                    <div className="stat p-4 bg-muted rounded-lg">
                    <h3 className="text-2xl font-bold">₹2.5 Crore+</h3>
                    <p className="text-sm text-muted-foreground">Paid to Users</p>
                    </div>
                    <div className="stat p-4 bg-muted rounded-lg">
                    <h3 className="text-2xl font-bold">Instant</h3>
                    <p className="text-sm text-muted-foreground">Withdrawals</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <h2 className="text-3xl font-bold">Popular Earning Tasks</h2>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Task Type</TableHead>
                                    <TableHead>Time Required</TableHead>
                                    <TableHead className="text-right">Average Earnings</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                    <TableCell>🎮 Puzzle Game (Level 20)</TableCell>
                                    <TableCell>20-30 minutes</TableCell>
                                    <TableCell className="text-right font-medium">₹85</TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell>📝 Shopping Survey</TableCell>
                                    <TableCell>10-15 minutes</TableCell>
                                    <TableCell className="text-right font-medium">₹120</TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell>🎬 Watch 5 Product Videos</TableCell>
                                    <TableCell>8-10 minutes</TableCell>
                                    <TableCell className="text-right font-medium">₹50</TableCell>
                                    </TableRow>
                                    <TableRow>
                                    <TableCell>📱 Test New Food Delivery App</TableCell>
                                    <TableCell>15-20 minutes</TableCell>
                                    <TableCell className="text-right font-medium">₹200</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="screenshots grid grid-cols-3 gap-4">
                        <Image src="https://picsum.photos/seed/app1/300/600" alt="OR Wallet task screen" width={300} height={600} className="rounded-lg shadow-md" data-ai-hint="app screenshot"/>
                        <Image src="https://picsum.photos/seed/app2/300/600" alt="OR Wallet earnings screen" width={300} height={600} className="rounded-lg shadow-md" data-ai-hint="app earning screenshot" />
                        <Image src="https://picsum.photos/seed/app3/300/600" alt="OR Wallet withdrawal proof" width={300} height={600} className="rounded-lg shadow-md" data-ai-hint="payment proof" />
                    </div>
                </div>

                <Card className="w-full">
                    <CardHeader className="text-center">
                    <div className="flex justify-center items-center mb-2">
                        <div className="font-bold text-2xl text-primary">
                        OR Wallet
                        </div>
                    </div>
                    <CardTitle className="text-2xl">{isSignUp ? 'Create an Account' : 'Sign In & Start Earning'}</CardTitle>
                    <CardDescription>
                        {isSignUp 
                        ? 'Enter your details to start earning.' 
                        : 'Sign in to continue your earning journey.'
                        }
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
                                    <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
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
                                <Input placeholder="name@example.com" {...field} disabled={isSubmitting}/>
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
                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting}/>
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
                                    <Input type="tel" placeholder="98765 43210" {...field} className="pl-10" disabled={isSubmitting}/>
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
                                        disabled={isSubmitting}
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
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Sign Up & Start Earning' : 'Sign In')}
                        </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        {isSignUp ? (
                        <>
                            Already have an account?{' '}
                            <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(false)} disabled={isSubmitting}>
                            Sign In
                            </Button>
                        </>
                        ) : (
                        <>
                            Don't have an account?{' '}
                            <Button variant="link" className="p-0 h-auto" onClick={() => setIsSignUp(true)} disabled={isSubmitting}>
                            Sign Up
                            </Button>
                        </>
                        )}
                    </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
