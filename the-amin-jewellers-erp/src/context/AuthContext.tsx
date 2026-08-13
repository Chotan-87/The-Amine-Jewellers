import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string;
  shopName: string;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string, shop?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('Owner / ম্যানেজার');
  const [shopName, setShopName] = useState<string>('দি আমিন জুয়েলার্স');
  const isAuthenticatingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch custom user profile from Firestore if available
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.role) setUserRole(data.role);
            if (data.shopName) setShopName(data.shopName);
          } else {
            // Create default user profile doc
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'আমিন ইউজার',
              role: 'Owner / মালিক',
              shopName: 'দি আমিন জুয়েলার্স',
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (err) {
          console.warn('User profile fetch notice:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        throw new Error('network-request-failed');
      }
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role: string = 'Owner / মালিক') => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        try {
          const userDocRef = doc(db, 'users', res.user.uid);
          await setDoc(userDocRef, {
            uid: res.user.uid,
            email: res.user.email,
            displayName: name,
            role: role,
            shopName: 'দি আমিন জুয়েলার্স',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Register Firestore sync notice:', err);
        }
        setUserRole(role);
      }
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        throw new Error('network-request-failed');
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (isAuthenticatingRef.current) {
      console.warn('Google authentication is already in progress.');
      return;
    }
    isAuthenticatingRef.current = true;
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          const userDocRef = doc(db, 'users', res.user.uid);
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              uid: res.user.uid,
              email: res.user.email,
              displayName: res.user.displayName || 'গুগল ইউজার',
              role: 'Owner / মালিক',
              shopName: 'দি আমিন জুয়েলার্স',
              createdAt: new Date().toISOString()
            }, { merge: true });
          } else {
            const data = docSnap.data();
            if (data.role) setUserRole(data.role);
            if (data.shopName) setShopName(data.shopName);
          }
        } catch (dbErr) {
          console.warn('Google login user doc sync notice:', dbErr);
        }
      }
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed-by-user')) {
        console.info('Google sign-in popup was closed by user.');
        throw new Error('popup-closed-by-user');
      } else if (code === 'auth/cancelled-popup-request' || msg.includes('cancelled-popup-request')) {
        console.info('Google sign-in popup request cancelled.');
        throw new Error('cancelled-popup-request');
      } else if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        console.warn('Network request failed during Google sign-in.');
        throw new Error('network-request-failed');
      } else if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        console.warn('Google sign-in popup blocked by browser.');
        throw new Error('popup-blocked');
      } else {
        console.error('Google sign-in error:', err);
        throw err;
      }
    } finally {
      isAuthenticatingRef.current = false;
    }
  };

  const loginAsGuest = () => {
    setUser({
      uid: 'guest-demo-id',
      email: 'demo@aminjewellers.com',
      displayName: 'ডেমো ম্যানেজার',
      emailVerified: true,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'demo-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'demo'
    } as User);
    setUserRole('Guest / ডেমো ম্যানেজার');
    setShopName('দি আমিন জুয়েলার্স');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout network notice:', err);
    } finally {
      setUser(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        throw new Error('network-request-failed');
      }
      throw err;
    }
  };

  const updateUserProfile = async (name: string, shop?: string) => {
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: name });
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, {
          displayName: name,
          shopName: shop || shopName,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Update profile sync notice:', err);
      }
      if (shop) setShopName(shop);
      setUser({ ...auth.currentUser, displayName: name } as User);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      userRole,
      shopName,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginAsGuest,
      logout,
      resetPassword,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
