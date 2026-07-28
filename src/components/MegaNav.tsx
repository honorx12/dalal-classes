'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string; description: string }[]
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Features',
    href: '#features',
    children: [
      { label: 'Lead Capture', href: '#lead-capture', description: 'Capture leads in real-time' },
      { label: 'Dashboard', href: '#dashboard', description: 'Track and manage leads' },
      { label: 'Analytics', href: '#analytics', description: 'Data-driven insights' },
      { label: 'Integrations', href: '#integrations', description: 'Connect your tools' },
    ],
  },
  {
    label: 'Resources',
    href: '#resources',
    children: [
      { label: 'Blog', href: '#blog', description: 'Tips and insights' },
      { label: 'Case Studies', href: '#case-studies', description: 'Success stories' },
      { label: 'Documentation', href: '#docs', description: 'API and guides' },
      { label: 'Support', href: '#support', description: 'Get help' },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
]

function DropdownMenu({
  item,
  isOpen,
  onClose,
}: {
  item: NavItem
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && item.children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 pt-2"
          onMouseEnter={() => {}}
          onMouseLeave={onClose}
        >
          <div className="w-64 rounded-xl bg-slate-900 border border-slate-700/50 shadow-xl shadow-black/50 overflow-hidden">
            <div className="p-2">
              {item.children.map((child, index) => (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={onClose}
                  className="block p-3 rounded-lg hover:bg-slate-800/50 transition-colors duration-200 group"
                >
                  <div className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                    {child.label}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {child.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-72 bg-slate-900 border-l border-slate-700/50 z-50 md:hidden"
          >
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-1.5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">LeadDesk</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <div className="space-y-2">
                      <p className="text-white font-medium px-3 py-2">{item.label}</p>
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={onClose}
                            className="block px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-3 py-2 text-white font-medium hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
              <Link
                href="/admin/login"
                onClick={onClose}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium"
              >
                Admin Login
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function MegaNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                LeadDesk Mini
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeDropdown === item.label
                        ? 'text-white bg-slate-800/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </Link>

                  {item.children && (
                    <DropdownMenu
                      item={item}
                      isOpen={activeDropdown === item.label}
                      onClose={() => setActiveDropdown(null)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block">
              <Link
                href="/admin/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
              >
                Admin Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  )
}
