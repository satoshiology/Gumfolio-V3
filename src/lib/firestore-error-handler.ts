export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): void {
  const auth = {
    currentUser: JSON.parse(localStorage.getItem('firebase:auth') || 'null') // Simplified access
  };
  
  const errorInfo: FirestoreErrorInfo = {
    error: error.message,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null
    }
  };
  
  console.error("Firestore Operation Failed:", JSON.stringify(errorInfo));
  throw new Error(JSON.stringify(errorInfo));
}
