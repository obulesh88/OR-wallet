
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (process.env.NODE_ENV === 'development') {
    // Point to the emulators running on localhost.
    // NOTE: In a deployed environment, this block will not be executed.
    try {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
    } catch (e) {
        console.error('Error connecting to Firebase emulators. This is normal if the emulators are not running.');
    }
  }

  return { app, auth, firestore };
}
