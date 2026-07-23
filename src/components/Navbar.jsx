import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabaseClient';
import {
  Menu,
  X,
  User,
  LogOut,
  GraduationCap,
  Sun,
  Moon,
  Shield,
  ChevronRight,
  Search,
  Bell,
  BookOpen,
} from 'lucide-react';

const dropdownMotion = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.18 },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowSearch(false);
    setShowNotifications(false);
  }, [location]);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 5));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, description')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      setSearchResults(data || []);
    };

    const timeoutId = setTimeout(searchCourses, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
  ];

  const isActive = (path) => location.pathname === path;

  const iconBtn = 'p-2.5 rounded-xl bg-surface/5 border border-line/10 text-content-muted hover:text-content hover:bg-surface/10 hover:border-line/20 transition-all duration-300';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || showSearch
          ? 'bg-base/80 backdrop-blur-xl border-b border-line/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-vivid flex items-center justify-center shadow-glow-brand group-hover:shadow-glow-lg transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold text-content group-hover:text-accent-cyan transition-colors duration-300">
                Dalal Classes
              </span>
              <span className="text-[10px] text-content-muted uppercase tracking-wider font-medium">Learn For Free</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                  isActive(link.href)
                    ? 'text-accent-cyan bg-surface/5'
                    : 'text-content-secondary hover:text-content hover:bg-surface/5'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-cyan"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={iconBtn}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div {...dropdownMotion} className="absolute right-0 top-full mt-2 w-80 bg-elevated/95 backdrop-blur-xl border border-line/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-line/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search courses..."
                          className="w-full pl-10 pr-4 py-2 bg-surface/5 border border-line/10 rounded-lg text-content text-sm placeholder:text-content-muted focus:border-brand/50 focus:outline-none"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => {
                              navigate(`/courses/${course.id}`);
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-surface/5 transition-colors border-b border-line/5 last:border-0"
                          >
                            <p className="text-sm font-medium text-content">{course.title}</p>
                            <p className="text-xs text-content-muted line-clamp-1 mt-1">{course.description}</p>
                          </button>
                        ))
                      ) : searchQuery ? (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-content-muted">No courses found</p>
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <BookOpen className="w-8 h-8 text-content-muted mx-auto mb-2" />
                          <p className="text-sm text-content-muted">Start typing to search courses</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications - Only for logged in users */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative ${iconBtn}`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-rose text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div {...dropdownMotion} className="absolute right-0 top-full mt-2 w-80 bg-elevated/95 backdrop-blur-xl border border-line/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-3 border-b border-line/10 flex items-center justify-between">
                        <span className="font-display font-semibold text-content">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-accent-cyan">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => markNotificationRead(notification.id)}
                              className={`w-full px-4 py-3 text-left hover:bg-surface/5 transition-colors border-b border-line/5 last:border-0 ${
                                !notification.read ? 'bg-surface/[0.02]' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !notification.read ? 'bg-accent-cyan' : 'bg-content-muted/50'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-content">{notification.title}</p>
                                  <p className="text-xs text-content-muted line-clamp-2 mt-0.5">{notification.message}</p>
                                  <p className="text-xs text-content-muted/70 mt-1">
                                    {new Date(notification.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-content-muted mx-auto mb-2" />
                            <p className="text-sm text-content-muted">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-line/10">
                          <button
                            onClick={() => navigate('/profile?tab=notifications')}
                            className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={iconBtn}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {user ? (
              <>
                {/* Admin Button */}
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="p-2.5 rounded-xl bg-brand/10 border border-brand/30 text-brand hover:bg-brand/20 transition-all duration-300"
                    aria-label="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}

                {/* Profile */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-xl bg-surface/5 border border-line/10 text-content-secondary hover:text-content hover:bg-surface/10 hover:border-line/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-vivid flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-sm">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-surface/5 border border-line/10 text-content-muted hover:text-accent-rose hover:border-accent-rose/50 hover:bg-accent-rose/10 transition-all duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-content-secondary hover:text-content border border-line/10 hover:border-line/30 rounded-xl hover:bg-surface/5 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-vivid text-white text-sm font-semibold rounded-xl hover:shadow-glow-brand hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-display"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={iconBtn}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl bg-surface/5 border border-line/10 text-content-secondary hover:text-content hover:bg-surface/10 transition-all duration-300"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showSearch || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSearch(false);
            setShowNotifications(false);
          }}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-base/95 backdrop-blur-xl border-t border-line/10 px-4 py-4 space-y-2">
          {/* Mobile Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 bg-surface/5 border border-line/10 rounded-xl text-content text-sm placeholder:text-content-muted focus:border-brand/50 focus:outline-none"
            />
            {searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-elevated border border-line/10 rounded-xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => {
                        navigate(`/courses/${course.id}`);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-surface/5 transition-colors border-b border-line/5 last:border-0"
                    >
                      <p className="text-sm font-medium text-content">{course.title}</p>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center">
                    <p className="text-sm text-content-muted">No courses found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav Links Mobile */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? 'bg-brand/10 text-accent-cyan border border-brand/30'
                  : 'text-content-secondary hover:text-content hover:bg-surface/5'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-line/10 pt-2 mt-2">
            {user ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-brand font-medium hover:bg-surface/5 rounded-xl transition-all duration-300"
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}

                {/* Mobile Notifications */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-content-secondary font-medium hover:bg-surface/5 rounded-xl transition-all duration-300"
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-accent-rose text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && notifications.length > 0 && (
                  <div className="px-4 py-2 space-y-2">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg text-sm ${!notification.read ? 'bg-surface/[0.02]' : ''}`}
                      >
                        <p className="font-medium text-content">{notification.title}</p>
                        <p className="text-content-muted text-xs mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-content-secondary font-medium hover:bg-surface/5 rounded-xl transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-accent-rose font-medium hover:bg-accent-rose/10 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-content-secondary font-medium hover:bg-surface/5 rounded-xl transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-3 mt-2 bg-gradient-vivid text-white font-semibold rounded-xl text-center hover:shadow-glow-brand transition-all duration-300 font-display"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
