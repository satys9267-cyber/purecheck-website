import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, Database, set } from 'firebase/database';
import { RawNodeMCUTelemetry } from '@/types/telemetry';

export interface FirebaseConfigOptions {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const LOCAL_STORAGE_KEY = 'purecheck_custom_firebase_config';

export function getStoredFirebaseConfig(): FirebaseConfigOptions | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveStoredFirebaseConfig(config: FirebaseConfigOptions) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredFirebaseConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function getActiveFirebaseConfig(): FirebaseConfigOptions {
  const localConfig = getStoredFirebaseConfig();
  if (localConfig && localConfig.databaseURL) {
    return localConfig;
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCEDZQDDpi8glzmbq4gPaF8UgVuznIDhJs',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'purecheck-website.firebaseapp.com',
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://purecheck-website-default-rtdb.firebaseio.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'purecheck-website',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'purecheck-website.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '544623453813',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:544623453813:web:7a5dbdb910743f38e27a3c',
  };
}

export function isFirebaseConfigured(): boolean {
  const cfg = getActiveFirebaseConfig();
  return Boolean(cfg.databaseURL && !cfg.databaseURL.includes('your_project_id') && cfg.databaseURL.startsWith('http'));
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Database | null = null;

export function getFirebaseDb(): Database | null {
  const config = getActiveFirebaseConfig();
  if (!config.databaseURL || config.databaseURL.includes('your_project_id')) {
    return null;
  }

  try {
    if (!appInstance) {
      if (getApps().length > 0) {
        appInstance = getApp();
      } else {
        appInstance = initializeApp(config);
      }
    }
    if (!dbInstance && appInstance) {
      dbInstance = getDatabase(appInstance);
    }
    return dbInstance;
  } catch (error) {
    console.warn('PureCheck: Failed to initialize Firebase Realtime Database:', error);
    return null;
  }
}

/**
 * Subscribes to real-time telemetry at `/devices/nodemcu_01`
 */
export function subscribeToDevice(
  deviceId: string = 'nodemcu_01',
  onData: (data: RawNodeMCUTelemetry) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) {
    return () => {};
  }

  const deviceRef = ref(db, `devices/${deviceId}`);

  const unsubscribe = onValue(
    deviceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        onData(val as RawNodeMCUTelemetry);
      }
    },
    (error) => {
      console.error('Firebase Realtime Database Error:', error);
      if (onError) onError(error);
    }
  );

  return () => {
    off(deviceRef);
  };
}

/**
 * Utility to write a sample telemetry payload (used for testing or seeding)
 */
export async function pushSampleTelemetry(
  deviceId: string = 'nodemcu_01',
  payload: Partial<RawNodeMCUTelemetry>
) {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not configured');

  const fullPayload: RawNodeMCUTelemetry = {
    deviceName: 'PureCheck-NodeMCU-01',
    tds: 124.5,
    voltage: 0.62,
    ec: 249.0,
    rssi: -58,
    ip: '192.168.1.104',
    lastSeen: Date.now(),
    ...payload,
  };

  const deviceRef = ref(db, `devices/${deviceId}`);
  await set(deviceRef, fullPayload);
}
