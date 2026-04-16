import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { label: 'Artificial Intelligence', href: '/courses/11111111-1111-1111-1111-111111111111' },
      { label: 'Machine Learning', href: '/courses/22222222-2222-2222-2222-222222222222' },
      { label: 'Data Analytics', href: '/courses/33333333-3333-3333-3333-333333333333' },
      { label: 'Web Development', href: '/courses/44444444-4444-4444-4444-444444444444' },
      { label: 'Cybersecurity', href: '/courses/55555555-5555-5555-5555-555555555555' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  };

  return (
    <footer className="bg-dark-card/50 backdrop-blur-xl border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Dalal Classes</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6">
              Master future skills with expert guidance. All courses are completely FREE.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-violet/20 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-violet/20 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-violet/20 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contact@dalalclasses.com" className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-violet/20 transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Free Courses</h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-accent-cyan text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-border text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            © {currentYear} Dalal Classes. Made with <Heart className="w-4 h-4 text-red-500" />. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
