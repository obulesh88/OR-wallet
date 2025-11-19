
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // This should only happen in local development or if the env var is missing.
    console.log("Initializing Firebase Admin with default credentials. Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in production.");
    admin.initializeApp();
  }
}

export { admin };
