import React from 'react';

export default function MobileMenu({ isOpen }) {
  const links = [
    { href: '#', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About Us' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
      <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
          >
            {link.label}
          </a>
        ))}
        <div className="mt-4 space-y-2">
          {/* In a real app, you'd conditionally show these or a Profile link if logged in */}
          <button className="block w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md">
            Login
          </button>
          <button className="block w-full px-3 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-md">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
