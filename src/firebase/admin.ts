
import * as admin from 'firebase-admin';

// The service account key is not available in this environment.
// We will initialize with default credentials.

if (!admin.apps.length) {
    console.log("Initializing Firebase Admin with default credentials.");
    admin.initializeApp();
}

export { admin };
