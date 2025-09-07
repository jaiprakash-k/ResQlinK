
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

dotenv.config();

let initialized = false;
let mode = 'uninitialized'; // 'fallback' | 'serviceAccountFile' | 'envVars'
let cachedApi = null;

function buildFallback() {
  if (initialized) return cachedApi;
  console.warn('[firebaseService] FALLBACK MODE: no real Firebase credentials. Data is ephemeral (in-memory).');
  const inMem = {
    _collections: {},
    collection(name) {
      if (!this._collections[name]) this._collections[name] = new Map();
      const store = this._collections[name];
      return {
        add(doc) { const id = 'local_' + Math.random().toString(36).slice(2,10); store.set(id,{...doc}); return Promise.resolve({ id }); },
        doc(id) { if (!id) id = 'local_' + Math.random().toString(36).slice(2,10); return { id, set(data, opts){ store.set(id,{ ...(opts?.merge ? (store.get(id)||{}) : {}), ...data }); return Promise.resolve(); } }; },
        orderBy(){ return this; }, limit(){ return this; },
        get(){ const docs=[...store.entries()].map(([id,data])=>({id,data:()=>data})); return Promise.resolve({ docs, forEach(fn){ docs.forEach(d=>fn({ id:d.id, data:()=>d.data() })); } }); }
      };
    },
    batch(){ const ops=[]; return { set(ref,data,opts){ ops.push(()=>ref.set(data,opts)); }, commit(){ ops.forEach(f=>f()); return Promise.resolve(); } }; },
  };
  const fakeAuthUsers = new Map();
  const fakeAuth = {
    createUser({ uid, email }) { if (!uid) uid = 'u_' + Math.random().toString(36).slice(2,10); fakeAuthUsers.set(uid,{ uid, email }); return Promise.resolve({ uid, email }); },
    getUserByEmail(email){ for (const u of fakeAuthUsers.values()) if (u.email===email) return Promise.resolve(u); return Promise.reject(new Error('not-found')); },
    createCustomToken(uid){ return Promise.resolve('token_'+uid); },
  };
  cachedApi = { firestore: () => inMem, auth: () => fakeAuth };
  initialized = true;
  mode = 'fallback';
  return cachedApi;
}

export function initFirebase() {
  if (initialized) return cachedApi || admin;

  const env = process.env;
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_BASE64,
    BACKEND_SERVICE_ACCOUNT_FILE,
    ALLOW_FIREBASE_FALLBACK,
  } = env;

  const allowFallback = ALLOW_FIREBASE_FALLBACK === '1' || ALLOW_FIREBASE_FALLBACK === 'true';

  // 1. Prefer explicit service account file if present
  if (BACKEND_SERVICE_ACCOUNT_FILE) {
    const resolved = path.resolve(BACKEND_SERVICE_ACCOUNT_FILE);
    if (fs.existsSync(resolved)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(parsed) });
        initialized = true; mode = 'serviceAccountFile';
        console.log('[firebaseService] REAL MODE: using service account file');
        return admin;
      } catch (err) {
        console.error('[firebaseService] Failed reading service account file:', err.message);
        if (!allowFallback) throw err;
        return buildFallback();
      }
    } else {
      const message = `[firebaseService] Service account file not found at ${resolved}`;
      if (!allowFallback) {
        throw new Error(message);
      } else {
        console.warn(message + '; using fallback.');
        return buildFallback();
      }
    }
  }

  // 2. Env vars path
  let privateKey = FIREBASE_PRIVATE_KEY;
  if ((!privateKey || !privateKey.trim()) && FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      privateKey = Buffer.from(FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
    } catch (err) {
      if (!allowFallback) throw new Error('Failed to decode FIREBASE_PRIVATE_KEY_BASE64: ' + err.message);
      return buildFallback();
    }
  }

  const missingCore = !FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !privateKey;
  const placeholderKey = privateKey && /REPLACE_WITH_YOUR_PRIVATE_KEY_CONTENT/.test(privateKey);

  if (missingCore || placeholderKey) {
    if (allowFallback) return buildFallback();
    throw new Error('[firebaseService] Missing or placeholder Firebase env vars. Provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (or *_BASE64).');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
  initialized = true; mode = 'envVars';
  return admin;
}

export function getFirestore() {
  return initFirebase().firestore();
}

export function getAuth() {
  return initFirebase().auth();
}

export function getFirebaseMode() { return mode; }
