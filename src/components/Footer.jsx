import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Mail, Heart, ArrowUpRight, Sparkles } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { label: 'Artificial Intelligence', href: '/courses' },
      { label: 'Machine Learning', href: '/courses' },
      { label: 'Data Analytics', href: '/courses' },
      { label: 'Web Development', href: '/courses' },
      { label: 'Cybersecurity', href: '/courses' },
    ],
    resources: [
      { label: 'How It Works', href: '/' },
      { label: 'FAQ', href: '/' },
      { label: 'Support', href: 'mailto:support@dalalclasses.com' },
      { label: 'Blog', href: '/' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Mail, href: 'mailto:contact@dalalclasses.com', label: 'Email' },
  ];

  return (
    <footer className="relative bg-base border-t border-line/[0.06]">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand group-hover:shadow-glow-lg transition-all duration-300">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold text-content">Dalal Classes</span>
                <span className="text-xs text-content-muted flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent-amber" />
                  Free Education for All
                </span>
              </div>
            </Link>

            <p className="text-content-muted text-sm leading-relaxed max-w-sm">
              Master future skills with expert guidance. Join thousands of students learning AI,
              Machine Learning, Data Analytics, and more. All courses are completely FREE.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-surface/5 border border-line/10 flex items-center justify-center text-content-muted hover:text-content hover:bg-brand/20 hover:border-brand/30 hover:shadow-glow-brand transition-all duration-300"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses Column */}
          <div>
            <h3 className="font-display font-bold text-content mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              Free Courses
            </h3>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="group flex items-center gap-1 text-content-muted hover:text-accent-cyan text-sm transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-display font-bold text-content mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-emerald" />
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-content-muted hover:text-accent-emerald text-sm transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-display font-bold text-content mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-amber" />
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-content-muted hover:text-accent-amber text-sm transition-colors duration-200"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-line/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h4 className="font-display font-semibold text-content mb-1">Stay Updated</h4>
              <p className="text-content-muted text-sm">Get notified about new courses and updates</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1 md:w-64"
              />
              <button className="btn-glow px-6 py-3 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-line/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-content-muted text-sm flex items-center gap-1">
              © {currentYear} Dalal Classes. Made with
              <Heart className="w-4 h-4 text-accent-rose fill-accent-rose animate-pulse" />
              for learners worldwide.
            </p>
            <div className="flex items-center gap-6 text-sm text-content-muted">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
