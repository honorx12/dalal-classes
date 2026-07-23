import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

/**
 * Subscription store. Reads the current user's plan from the `subscriptions`
 * + `plans` tables. Degrades gracefully to the free plan when the tables do
 * not exist yet (migration 004 not applied) or the user has no subscription.
 */
export const useSubscriptionStore = create((set, get) => ({
  plan: 'free',        // 'free' | 'pro'
  subscription: null,  // raw subscriptions row (+ joined plan)
  loading: false,
  fetched: false,

  fetchSubscription: async (userId) => {
    if (!userId) {
      set({ plan: 'free', subscription: null, fetched: true });
      return;
    }
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      // Missing table / RLS / no row => stay on free, never throw to UI.
      if (error || !data) {
        set({ plan: 'free', subscription: null, loading: false, fetched: true });
        return;
      }

      set({
        plan: data.plan?.slug || 'pro',
        subscription: data,
        loading: false,
        fetched: true,
      });
    } catch (err) {
      set({ plan: 'free', subscription: null, loading: false, fetched: true });
    }
  },

  reset: () => set({ plan: 'free', subscription: null, fetched: false }),

  isPro: () => get().plan === 'pro',
}));

export default useSubscriptionStore;
