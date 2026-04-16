import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Menu, X, User, LogOut, GraduationCap, Sun, Moon, Shield } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-dark-card/80 backdrop-blur-xl border-b border-dark-border shadow-card' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center shadow-glow-violet group-hover:shadow-glow transition-shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-accent-violet transition-colors">
              Dalal Classes
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-accent-cyan'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-dark-card/50 border border-dark-border text-slate-300 hover:text-white hover:border-accent-violet/50 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="p-2 rounded-lg bg-accent-violet/20 border border-accent-violet/30 text-accent-violet hover:bg-accent-violet/30 transition-all"
                    aria-label="Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-card/50 border border-dark-border text-slate-300 hover:text-white hover:border-accent-cyan/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-dark-card/50 border border-dark-border text-slate-300 hover:text-red-400 hover:border-red-500/50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-dark-card/50 border border-dark-border text-slate-300 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-dark-card/95 backdrop-blur-xl border-t border-dark-border animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-slate-300 hover:text-white"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-2 px-4 rounded-lg font-medium ${
                  location.pathname === link.href
                    ? 'bg-accent-violet/20 text-accent-cyan'
                    : 'text-slate-300 hover:text-white hover:bg-dark-card'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <hr className="border-dark-border" />
            
            {user ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-2 px-4 text-accent-violet font-medium"
                  >
                    <Shield className="w-5 h-5" />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block py-2 px-4 text-slate-300 font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full py-2 px-4 text-red-400 font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 px-4 text-slate-300 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-lg text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
