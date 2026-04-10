// src/config.js
export const CONFIG = {
  appName: 'Dalal Classes',
  appDescription: 'Master future skills with expert guidance',
  
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'TO_BE_ADDED_LATER',
  
  workerUrl: import.meta.env.VITE_WORKER_URL || 'TO_BE_ADDED_LATER',
  
  courseDefaults: {
    currency: 'INR',
    freeChapters: 3,
  },

  routes: {
    home: '/',
    courses: '/courses',
    login: '/login',
    signup: '/signup',
    profile: '/profile',
  },

  gradients: {
    'ai': 'from-purple-600 to-blue-600',
    'ml': 'from-green-600 to-teal-600',
    'data': 'from-orange-500 to-red-600',
    'web': 'from-pink-500 to-purple-600',
  },
};
