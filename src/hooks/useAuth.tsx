import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'consumer' | 'vendor' | 'admin';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole | null;
  business_name: string | null;
  business_license: string | null;
  contact_person: string | null;
  phone: string | null;
  is_approved: boolean | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, businessInfo?: {
    businessName: string;
    businessLicense: string;
    businessAddress: string;
    businessDescription?: string;
    contactPerson: string;
  }) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, userMetadata?: any) => {
    try {
      console.log('🔐 Fetching profile for user:', userId);

      // First try to get the profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, business_name, business_license, contact_person, phone, is_approved')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('⚠️ Profile fetch error, attempting to create profile:', error.message);

        // Try to create profile if it doesn't exist
        try {
          const { error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: userMetadata?.full_name || null,
              email: userMetadata?.email || null,
              role: (userMetadata?.role as UserRole) || 'consumer',
              is_approved: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (createError) {
            console.error('❌ Failed to create profile:', createError);
          } else {
            console.log('✅ Profile created successfully');

            // Try to fetch again
            const { data: newProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('id, full_name, role, business_name, business_license, contact_person, phone, is_approved')
              .eq('id', userId)
              .single();

            if (!fetchError && newProfile) {
              console.log('✅ Successfully fetched newly created profile:', newProfile);
              return newProfile;
            }
          }
        } catch (createException) {
          console.error('❌ Profile creation exception:', createException);
        }

        // Return fallback profile if everything failed
        console.log('🔄 Returning fallback profile');
        return {
          id: userId,
          full_name: userMetadata?.full_name || null,
          role: (userMetadata?.role as UserRole) || 'consumer',
          business_name: null,
          business_license: null,
          contact_person: null,
          phone: null,
          is_approved: true, // Default to approved for consumers
        };
      }

      console.log('✅ Successfully fetched profile:', profile);
      return profile;
    } catch (error) {
      console.error('❌ Profile fetch exception:', error);

      // Return fallback profile
      return {
        id: userId,
        full_name: userMetadata?.full_name || null,
        role: (userMetadata?.role as UserRole) || 'consumer',
        business_name: null,
        business_license: null,
        contact_person: null,
        phone: null,
        is_approved: true,
      };
    }
  };

  useEffect(() => {
    console.log('🔐 AuthProvider mounting...');
    let mounted = true;

    // Initialize auth immediately
    const initAuth = async () => {
      console.log('🔐 Getting initial session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('🔐 Session error:', error);
        }
        
        console.log('🔐 Initial session:', session ? `found for ${session.user?.email}` : 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile in background, don't block loading
          fetchUserProfile(session.user.id, session.user.user_metadata)
            .then(profile => {
              if (mounted) {
                console.log('🔐 Profile loaded:', profile);
                setUserProfile(profile);
              }
            })
            .catch(err => console.error('🔐 Profile load failed:', err));
        }
        
        // Always set loading to false after initial session check
        console.log('🔐 Setting loading to false');
        setLoading(false);
        
      } catch (error) {
        console.error('🔐 Init error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change:', event, session ? `session for ${session.user?.email}` : 'no session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile in background
          fetchUserProfile(session.user.id, session.user.user_metadata)
            .then(profile => {
              if (mounted) {
                setUserProfile(profile);
              }
            })
            .catch(err => console.error('🔐 Profile load failed:', err));
        } else {
          setUserProfile(null);
        }
      }
    );

    // Initialize immediately
    initAuth();

    // Emergency timeout - force loading to false after 2 seconds
    const emergencyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('🔐 EMERGENCY: Forcing loading to false');
      setLoading(false);
      }
    }, 2000);

    return () => {
      console.log('🔐 AuthProvider cleanup');
      mounted = false;
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'consumer', businessInfo?: {
    businessName: string;
    businessLicense: string;
    businessAddress: string;
    businessDescription?: string;
    contactPerson: string;
  }) => {
    console.log('🔐 Starting signup for:', { email, fullName, role });

    try {
      // Step 1: Create auth user
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      console.log('🔐 Auth signup result:', {
        success: !error,
        userId: authData?.user?.id,
        error: error?.message
      });

      if (error) {
        return { error, data: authData };
      }

      // Step 2: If signup successful, ensure profile exists (wait a bit for trigger)
      if (authData?.user) {
        // Give the trigger a moment to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          // Try to verify profile was created
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, full_name')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
            console.warn('⚠️ Profile fetch warning:', profileError.message);

            // Try to manually create profile if trigger failed
            const { error: manualCreateError } = await supabase
              .from('profiles')
              .upsert({
                id: authData.user.id,
                full_name: fullName,
                email: email,
                role: role,
                is_approved: role === 'consumer' // Auto-approve consumers
              }, {
                onConflict: 'id'
              });

            if (manualCreateError) {
              console.error('❌ Manual profile creation failed:', manualCreateError);
            } else {
              console.log('✅ Profile created manually');
            }
          } else {
            console.log('✅ Profile found:', profile);
          }
        } catch (profileException) {
          console.error('❌ Profile verification exception:', profileException);
        }

        // Step 3: Handle vendor application if needed
        if (role === 'vendor' && businessInfo) {
          console.log('🔐 Creating vendor application...');

          try {
            const { error: appError } = await supabase
              .from('vendor_applications')
              .insert({
                user_id: authData.user.id,
                business_name: businessInfo.businessName,
                business_license: businessInfo.businessLicense,
                business_address: businessInfo.businessAddress,
                business_description: businessInfo.businessDescription || null,
                contact_person: businessInfo.contactPerson,
                email: email,
                status: 'pending'
              });

            if (appError) {
              console.error('❌ Error creating vendor application:', appError);
              // Don't fail the signup, just log the error
              // But add it to the main error so user knows
              error ? error.message += '. Vendor application failed: ' + appError.message : null;
            } else {
              console.log('✅ Vendor application created successfully');
            }
          } catch (appError) {
            console.error('❌ Exception creating vendor application:', appError);
          }
        }
      }

      return { error, data: authData };

    } catch (exception) {
      console.error('❌ Signup exception:', exception);
      return {
        error: {
          message: 'An unexpected error occurred during signup. Please try again.'
        },
        data: null
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('🔐 Sign in result:', error ? 'error' : 'success');
    return { error };
  };

  const signOut = async () => {
    console.log('🔐 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (!error) {
      console.log('🔐 Sign out successful');
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } else {
      console.error('🔐 Sign out error:', error);
    }
    return { error };
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!userProfile?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userProfile.role);
  };

  console.log('🔐 AuthProvider render - loading:', loading, 'user:', user?.email || 'none');

  return (
    <AuthContext.Provider value={{ user, session, userProfile, signUp, signIn, signOut, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
