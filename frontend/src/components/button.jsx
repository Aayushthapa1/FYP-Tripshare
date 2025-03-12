
/**
 * Button component - A versatile button component using Tailwind CSS
 *
 * @param {ReactNode} children - Button content
 * @param {Function} onClick - Click handler function
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'warning'
 * @param {string} size - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} disabled - Whether the button is disabled
 * @param {boolean} fullWidth - Whether the button should take full width
 * @param {string} type - Button type attribute ('button', 'submit', 'reset')
 * @param {ReactNode} leftIcon - Icon to display before the button text
 * @param {ReactNode} rightIcon - Icon to display after the button text
 * @param {boolean} isLoading - Whether to show a loading spinner
 * @param {string} loadingText - Text to display while loading
 * @param {string} className - Additional custom classes
 * @returns {JSX.Element}
 */
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button",
  leftIcon = null,
  rightIcon = null,
  isLoading = false,
  loadingText,
  className = "",
}) => {
  // Define variant classes using Tailwind
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500",
    outline: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400",
    success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm",
    warning: "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-400 shadow-sm",
    link: "bg-transparent text-blue-600 hover:text-blue-800 hover:underline focus:ring-blue-500 p-0",
  }

  // Define size classes using Tailwind
  const sizeClasses = {
    xs: "text-xs px-2.5 py-1.5 rounded",
    sm: "text-sm px-3 py-2 rounded-md",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-5 py-2.5 rounded-lg",
    xl: "text-base px-6 py-3 rounded-lg",
  }

  // Loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )

  // Combine all classes
  const buttonClasses = `
    inline-flex 
    items-center 
    justify-center 
    font-medium 
    transition-all 
    duration-200 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2
    ${variant !== "link" ? "leading-none" : ""}
    ${variantClasses[variant] || variantClasses.primary} 
    ${sizeClasses[size] || sizeClasses.md} 
    ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} 
    ${fullWidth ? "w-full" : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ")

  return (
    <button
      type={type}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      aria-disabled={disabled || isLoading}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}

export default Button

