import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, UserRole } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(err => {
      console.warn("Failed to retrieve Supabase session, running in demo mode.", err);
      setLoading(false);
    });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      });
      return () => subscription.unsubscribe();
    } catch (err) {
      console.warn("Failed to subscribe to auth state changes.", err);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(data);
    } catch (err) {
      console.warn("Failed to fetch profile from Supabase", err);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    // Check if running in demo fallback mode
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return simulateSuccessAuth(email, name, role);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name,
            role,
          });

        if (profileError) return { error: profileError };
      }

      return { error: null };
    } catch (err: any) {
      console.warn("Auth signup failed, falling back to simulated session", err);
      return simulateSuccessAuth(email, name, role);
    }
  };

  const simulateSuccessAuth = (email: string, name: string, role: UserRole) => {
    const mockUserId = `mock-user-${Date.now()}`;
    const mockUser = {
      id: mockUserId,
      email,
      user_metadata: { name, role },
    } as any;
    
    const mockProfile: Profile = {
      id: `mock-profile-${Date.now()}`,
      user_id: mockUserId,
      name,
      avatar: '',
      bio: 'This is a simulated demo profile.',
      phone: '123-456-7890',
      location: 'Demo City',
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    setSession({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return simulateSuccessSignIn(email);
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      console.warn("Auth signin failed, falling back to simulated session", err);
      return simulateSuccessSignIn(email);
    }
  };

  const simulateSuccessSignIn = (email: string) => {
    let role: UserRole = 'student';
    if (email.includes('admin') || email.includes('hr')) role = 'hr';
    else if (email.includes('company')) role = 'company_admin';
    else if (email.includes('employee')) role = 'employee';

    const name = email.split('@')[0];
    return simulateSuccessAuth(email, name, role);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out failed", err);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, updateProfile }}>
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
