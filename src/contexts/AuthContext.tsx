import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '@/types';
import { auth, database } from '@/lib/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { ref, get, child } from 'firebase/database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check for stored user on initial load
    const storedUser = localStorage.getItem('rms_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, `users/${firebaseUser.uid}`));
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const appUser: User = {
              id: firebaseUser.uid,
              name: userData.Name || userData.name || 'User',
              email: userData.email || firebaseUser.email || '',
              role: userData.role,
              schoolId: userData.schoolId,
              schoolName: userData.schoolName
            };
            setUser(appUser);
            localStorage.setItem('rms_user', JSON.stringify(appUser));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('rms_user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${uid}`));
      
      if (snapshot.exists()) {
        // The user state will be updated by the onAuthStateChanged listener
        // but we return true here to indicate success
        setIsLoading(false);
        return true;
      } else {
        console.error("User data not found in database");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    localStorage.removeItem('rms_user');
  }, []);

  // Demo function to switch between roles
  const switchRole = useCallback((role: UserRole) => {
    const roleUser = mockUsers.find(u => u.role === role);
    if (roleUser) {
      const extendedData = extendedUserData[roleUser.id] || {};
      const fullUser = { ...roleUser, ...extendedData };
      setUser(fullUser);
      localStorage.setItem('rms_user', JSON.stringify(fullUser));
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    switchRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to get role-based route
export function useRoleBasedRoute() {
  const { user } = useAuth();
  
  const getDefaultRoute = useCallback(() => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'super_admin':
        return '/super-admin';
      case 'school_admin':
        return '/school-admin';
      case 'principal':
        return '/principal';
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'parent':
        return '/parent';
      default:
        return '/login';
    }
  }, [user]);

  return { getDefaultRoute };
}
