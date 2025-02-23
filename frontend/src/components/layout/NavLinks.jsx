import React from 'react';

const links = [
  { href: '#', label: 'Home' },
  { href: 'Contact Us', label: 'Contact Us' },
];

export default function NavLinks() {
  return (
    <div className="hidden md:flex items-center mr-6  justify-center space-x-16">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="text-gray-900 hover:text-green-600 transition-colors font-medium whitespace-nowrap"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}