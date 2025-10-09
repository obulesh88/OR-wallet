'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const app = useFirebaseApp();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const auth = getAuth(app);
    try {
      if (isSignUp) {
        if (!data.name) {
          form.setError('name', { type: 'manual', message: 'Name is required for sign up.' });
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        await updateProfile(user, {
          displayName: data.name
        });

        // Generate a unique address
        const uniqueAddress = `ORA${user.uid.substring(0, 8).toUpperCase()}`;

        // Create user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: data.name,
          photoURL: user.photoURL,
          balance: 0,
          oraBalance: 100, // Starting bonus
          address: uniqueAddress,
        });

        toast({
          title: 'Account Created',
          description: 'You have been successfully signed up.',
        });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
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
            <div className="font-bold text-2xl text-red-500">
              OR
            </div>
          </div>
          <CardTitle>{isSignUp ? 'Create an Account' : 'Welcome to OR Wallet'}</CardTitle>

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
                Don&apos;t have an account?{' '}
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
