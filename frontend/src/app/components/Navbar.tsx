'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Gallery', href: '/gallery/sample' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-semibold tracking-wider text-gray-900">
            MR.K VISUALS
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-200 ${
                  pathname === link.href
                    ? 'text-black font-semibold'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/gallery/sample"
              className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
            >
              Client Gallery
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block py-3 text-center ${
                  pathname === link.href
                    ? 'text-black font-semibold'
                    : 'text-gray-500'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/gallery/sample"
              className="block py-3 text-center bg-black text-white rounded-lg mt-2"
              onClick={() => setMenuOpen(false)}
            >
              Client Gallery
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}