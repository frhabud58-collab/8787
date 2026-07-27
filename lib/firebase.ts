// Minimal stub for firebase — no external Firebase needed for local builds.

export const isFirebaseSimulated = true;

export const auth = {
  currentUser: null,
  onAuthStateChanged: (_cb: any) => () => {},
  signOut: async () => {},
};

export const googleProvider = {};

export async function signInWithEmailAndPassword(_email: string, _password: string) {
  return { user: null };
}

export async function createUserWithEmailAndPassword(_email: string, _password: string) {
  return { user: null };
}

export async function signInWithPopup(_auth: any, _provider: any) {
  return { user: null };
}

export async function logSystemActivity(action: string, details?: string) {
  try {
    const logs = JSON.parse(localStorage.getItem('mix_activity_logs') || '[]');
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      details: details || '',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('mix_activity_logs', JSON.stringify(logs.slice(0, 100)));
  } catch {}
}

export async function compressBase64(data: string): Promise<string> {
  return data;
}
