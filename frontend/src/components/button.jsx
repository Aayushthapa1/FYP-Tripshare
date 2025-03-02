// Button.jsx
import React from 'react';

/**
 * Button component - A versatile button component using Tailwind CSS
 * 
 * @param {ReactNode} children - Button content
 * @param {Function} onClick - Click handler function
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'small' | 'medium' | 'large'
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {string} type - Button type attribute ('button', 'submit', 'reset')
 * @param {string} className - Additional custom classes
 * @returns {JSX.Element}
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  // Define variant classes using Tailwind
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400"
  };

  // Define size classes using Tailwind
  const sizeClasses = {
    small: "text-xs px-3 py-2",
    medium: "text-sm px-4 py-2",
    large: "text-base px-6 py-3"
  };

  // Combine all classes
  const buttonClasses = `
    font-medium 
    rounded-md 
    transition-all 
    duration-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={buttonClasses}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;