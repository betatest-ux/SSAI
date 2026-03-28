import { useState, useEffect } from "react";
import { Platform } from "react-native";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

type User = {
  userId: string;
  email: string;
  name: string;
  isPremium: boolean;
  storiesGenerated: number;
  isAdmin: boolean;
  subscriptionEndDate?: string;
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>();
  const [registerError, setRegisterError] = useState<string | undefined>();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Loading user, session exists:', !!session);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);



  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error.message || JSON.stringify(error));
        return;
      }

      if (data) {
        setUser({
          userId: data.id,
          email: data.email,
          name: data.name,
          isPremium: data.is_premium,
          storiesGenerated: data.stories_generated,
          isAdmin: data.is_admin,
          subscriptionEndDate: data.subscription_end_date || undefined,
        });
      }
    } catch (error: any) {
      console.error('Failed to load user profile:', error?.message || JSON.stringify(error));
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    setIsLoggingIn(true);
    setLoginError(undefined);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setLoginError(error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Login successful, loading user profile...');
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);

        await loadUserProfile(data.user.id);
        console.log('User profile loaded after login');
      }

      return data;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    setIsRegistering(true);
    setRegisterError(undefined);
    try {
      console.log('Registering user:', email);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: Platform.OS === 'web' ? window.location.origin : undefined,
        },
      });

      if (authError) {
        console.error('Register error:', authError);
        setRegisterError(authError.message);
        throw new Error(authError.message);
      }

      if (authData.user) {
        console.log('Auth user created:', authData.user.id);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let retries = 5;
        let profileLoaded = false;
        
        while (retries > 0 && !profileLoaded) {
          try {
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            
            if (existingProfile) {
              console.log('User profile found via trigger');
              profileLoaded = true;
              await loadUserProfile(authData.user.id);
            } else {
              console.log('Profile not found, attempting manual creation...');
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: authData.user.id,
                  email: authData.user.email!,
                  name,
                  is_premium: false,
                  stories_generated: 0,
                  is_admin: false,
                });

              if (profileError && !profileError.message.includes('duplicate')) {
                console.error('Error creating user profile:', profileError);
                throw new Error(profileError.message);
              }
              
              profileLoaded = true;
              await loadUserProfile(authData.user.id);
            }
          } catch (error: any) {
            console.log(`Profile creation attempt failed, retries left: ${retries - 1}`, error.message);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
              throw new Error('Failed to create user profile. Please contact support.');
            }
          }
        }
      }

      return authData;
    } finally {
      setIsRegistering(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth login...');
      console.log('Platform:', Platform.OS);

      const redirectUrl = makeRedirectUri({
        scheme: 'exp',
        path: 'auth/callback',
      });

      console.log('Google login redirect URL:', redirectUrl);

      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          console.error('Google OAuth error:', error);
          if (error.message.includes('oauth')) {
            throw new Error('Google login is not configured. Please contact support.');
          }
          throw new Error(error.message);
        }

        console.log('Google OAuth initiated successfully');
        return data;
      } else {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          console.error('Google OAuth error:', error);
          throw new Error(error.message);
        }

        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl
          );

          if (result.type === 'success') {
            const { url } = result;
            const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          } else {
            throw new Error('Google login was cancelled or failed');
          }
        }

        return data;
      }
    } catch (error: any) {
      console.error('Google login failed:', error);
      if (error.message.includes('not configured') || error.message.includes('Provider not found')) {
        throw new Error('Google login is not available. Please use email/password login.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const upgradeToPremium = async () => {
    if (!user) throw new Error('User not found');
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const { error } = await supabase
      .from('users')
      .update({
        is_premium: true,
        subscription_end_date: subscriptionEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.userId);

    if (error) throw new Error(error.message);
    await loadUserProfile(user.userId);
  };

  const cancelSubscription = async () => {
    if (!user) throw new Error('User not found');

    const { error } = await supabase
      .from('users')
      .update({
        is_premium: false,
        subscription_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.userId);

    if (error) throw new Error(error.message);
    await loadUserProfile(user.userId);
  };

  const updateProfile = async ({ name, email }: { name?: string; email?: string }) => {
    if (!user) throw new Error('User not found');

    const updates: any = { updated_at: new Date().toISOString() };
    if (name) updates.name = name;
    if (email) updates.email = email;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.userId);

    if (error) throw new Error(error.message);

    if (email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) throw new Error(authError.message);
    }

    await loadUserProfile(user.userId);
  };

  const changePassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
    return { success: true };
  };

  const canGenerateStory = () => {
    if (!user) return false;
    return user.isPremium || user.storiesGenerated < 3;
  };

  const remainingFreeStories = () => {
    if (!user || user.isPremium) return null;
    return Math.max(0, 3 - user.storiesGenerated);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    upgradeToPremium,
    cancelSubscription,
    updateProfile,
    changePassword,
    canGenerateStory,
    remainingFreeStories,
    isLoggingIn,
    isRegistering,
    loginError,
    registerError,
  };
});
