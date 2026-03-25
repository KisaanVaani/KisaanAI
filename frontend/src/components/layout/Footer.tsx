'use client'

import { Github } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-forest border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-8">
          {/* Logo */}
          <div className="flex flex-col text-center md:text-left">
            <span className="font-display text-2xl text-gold font-bold">
              🌾 KisanVaani
            </span>
            <span className="text-cream/50 text-xs mt-1">
              AI Advisory for Every Farm
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="#"
              className="text-cream/70 hover:text-gold transition-colors text-sm"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-cream/70 hover:text-gold transition-colors text-sm"
            >
              Terms
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/70 hover:text-gold transition-colors text-sm"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-cream/70 hover:text-gold transition-colors text-sm"
            >
              Contact
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center md:justify-end">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/70 hover:text-gold transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-cream/10 pt-8 text-center">
          <p className="text-cream/40 text-sm">
            Built for Bharat 🇮🇳 · &copy; {currentYear} KisanVaani · Empowering Farmers with AI
          </p>
        </div>
      </div>
    </footer>
  )
}
