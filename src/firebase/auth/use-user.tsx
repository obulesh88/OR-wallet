'use client';

import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '../provider';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase might not be initialized yet
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsLoading(false);
      },
      (error) => {
        console.error('Auth state change error', error);
        setUser(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, isLoading };
};
