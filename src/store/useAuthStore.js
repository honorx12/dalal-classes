// src/store/useAuthStore.js
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

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
}));

export default useAuthStore;
