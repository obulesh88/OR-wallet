
'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { initializeFirebase } from './init';
import { FirebaseProvider, FirebaseContextValue } from './provider';

export function FirebaseClientProvider({ children }: PropsWithChildren) {
  const [firebase, setFirebase] = useState<FirebaseContextValue | null>(null);

  useEffect(() => {
    const init = async () => {
      const firebaseInstance = await initializeFirebase();
      setFirebase(firebaseInstance);
    };
    init();
  }, []);

  if (!firebase) {
    // You can show a loading spinner here
    return null;
  }

  return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
