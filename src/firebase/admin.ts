
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
    // This will initialize the app with Application Default Credentials
    // Useful for running in Google Cloud environments
    console.log("Initializing Firebase Admin with Application Default Credentials");
    admin.initializeApp();
  }
}

export { admin };
