export const CONFIG = {
  appName: 'Dalal Classes',
  appDescription: 'Master future skills with expert guidance',
  
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
    admin: '/admin',
  },

  gradients: {
    'ai': 'from-brand via-purple-600 to-indigo-700',
    'ml': 'from-green-500 via-emerald-600 to-teal-700',
    'data': 'from-orange-500 via-red-600 to-pink-700',
    'web': 'from-pink-500 via-purple-600 to-violet-700',
    'cyber': 'from-cyan-500 via-blue-600 to-indigo-700',
  },

  quiz: {
    passMark: 60,
    retryCooldownHours: 24,
  },
};

export const COURSE_IDS = {
  AI: '11111111-1111-1111-1111-111111111111',
  ML: '22222222-2222-2222-2222-222222222222',
  DATA: '33333333-3333-3333-3333-333333333333',
  WEB: '44444444-4444-4444-4444-444444444444',
  CYBER: '55555555-5555-5555-5555-555555555555',
};
