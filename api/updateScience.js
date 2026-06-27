// In api/updateScience.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

try {
  if (!initializeApp.length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
} catch (e) {
  console.error('Firebase Admin initialization error', e.stack);
}

const db = getFirestore();

// This is the main function that Vercel will run
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const gameStateRef = db.collection("artifacts/default-app-id/public/data/stats")
      .doc(userId).collection("gameState").doc("doc");
    
    // The rest of this logic is the same as the Cloud Function
    await db.runTransaction(async (transaction) => {
        // ... [The existing offline calculation logic will go here] ...
    });
    
    return res.status(200).json({ success: true, message: 'Science points updated.' });
  } catch (error) {
    console.error("Error in updateScience function:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}