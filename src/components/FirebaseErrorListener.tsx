'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a client-side component that listens for permission errors
// and throws them to be caught by the Next.js error overlay.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // We're re-throwing the error here.
      // In a Next.js development environment, this will be caught by the
      // error overlay, which is what we want for debugging.
      // You can implement your own logic here for production.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null; // This component doesn't render anything
}
