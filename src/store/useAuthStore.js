import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initializeUser: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await get().fetchProfile(session.user.id);
        set({ 
          user: session.user, 
          profile,
          loading: false,
          initialized: true 
        });
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await get().fetchProfile(session.user.id);
          set({ user: session.user, profile });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null, loading: false, initialized: true });
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  getUserFriendlyError: (error) => {
    if (!error) return null;
    const code = error.code || '';
    const message = error.message || '';
    const map = {
      email_not_confirmed: { type: 'email_not_confirmed', text: 'Please verify your email before signing in. Check your inbox for the confirmation link.' },
      invalid_credentials: { type: 'invalid_credentials', text: 'Invalid email or password. Please try again.' },
      user_not_found: { type: 'user_not_found', text: 'No account found with this email address.' },
      rate_limit: { type: 'rate_limited', text: 'Too many attempts. Please wait a moment before trying again.' },
      invalid_grant: { type: 'session_expired', text: 'Session expired. Please sign in again.' },
    };
    if (map[code]) return map[code];
    if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) return map.email_not_confirmed;
    if (message.includes('Invalid login credentials') || message.includes('invalid-credentials')) return map.invalid_credentials;
    if (message.includes('Too many requests') || message.includes('rate_limit')) return map.rate_limited;
    if (message.includes('Email not found') || message.includes('user_not_found')) return map.user_not_found;
    if (message.includes('invalid_grant') || message.includes('timeout')) return map.invalid_grant;
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('Network Error')) {
      return { type: 'network_error', text: 'Unable to connect to the server. Please check your internet connection and try again.' };
    }
    return { type: 'unknown', text: message || 'Something went wrong. Please try again.' };
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  resendConfirmationEmail: async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return data;
  },

  signup: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  forgotPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error) {
      set({ profile: data });
    }
    return { data, error };
  },

  isAuthenticated: () => !!get().user,

  isAdmin: () => {
    const profile = get().profile;
    return profile?.is_admin === true;
  },
}));

export default useAuthStore;
