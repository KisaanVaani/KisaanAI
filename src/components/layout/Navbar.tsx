'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#data-sources', label: 'Data Sources' },
    { href: '#technology', label: 'Technology' },
    { href: '#demo', label: 'Demo' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-forest/90 border-b border-gold/20 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <a href="#" className="flex flex-col">
              <span className="font-display text-2xl text-gold font-bold flex items-center">
                🌾 KisanVaani
              </span>
              <span className="text-cream/60 text-xs hidden sm:block">
                AI Advisory for Every Farm
              </span>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-cream/80 hover:text-gold transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="#demo"
              className="bg-gold text-forest font-semibold px-6 py-2.5 rounded-full hover:bg-gold/90 hover:scale-105 transition-all duration-200 text-sm inline-block"
            >
              Try the Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-cream p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-forest/95 backdrop-blur-lg border-t border-gold/20"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-cream/80 hover:text-gold transition-colors py-2 text-base font-medium"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-gold text-forest font-semibold px-6 py-3 rounded-full hover:bg-gold/90 transition-colors text-center mt-4"
              >
                Try the Demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
