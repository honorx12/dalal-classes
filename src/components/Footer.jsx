// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    courses: [
      { label: 'All Courses', href: '/courses' },
      { label: 'Artificial Intelligence', href: '/courses/11111111-1111-1111-1111-111111111111' },
      { label: 'Machine Learning', href: '/courses/22222222-2222-2222-2222-222222222222' },
      { label: 'Data Analytics', href: '/courses/33333333-3333-3333-3333-333333333333' },
      { label: 'Web Development', href: '/courses/44444444-4444-4444-4444-444444444444' },
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Refund Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-slate-900" />
              </div>
              <span className="text-xl font-bold">Dalal Classes</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6">
              Master future skills with expert guidance. Join thousands of students learning with Dalal Classes.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="mailto:contact@dalalclasses.com" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Courses</h3>
            <ul className="space-y-2">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
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
            <h3 className="font-semibold mb-4">Legal</h3>
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

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
          <p>© {currentYear} Dalal Classes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
