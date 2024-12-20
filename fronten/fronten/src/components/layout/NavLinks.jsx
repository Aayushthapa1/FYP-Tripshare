import React from 'react';

const links = [
  { href: '#', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About Us' },
  { href: '#contact', label: 'Contact' },
];

export default function NavLinks() {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-gray-900 hover:text-green-600 transition-colors font-medium"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}