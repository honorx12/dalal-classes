// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, User, LogOut, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthStore();
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
      isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 hero-gradient rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
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
                    ? 'text-amber-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-navy hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block py-2 font-medium ${
                  location.pathname === link.href
                    ? 'text-amber-600'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            <hr className="border-slate-100" />
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block py-2 text-slate-600 font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 text-slate-600 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-slate-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-amber-600 font-semibold"
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
