import React from 'react';

/**
 * Button: Flexible, reusable button component with multiple variants and sizes.
 * 
 * Variants:
 *   - 'secondary': Slate border (default for navigation buttons)
 *   - 'primary': Orange fill (for primary actions like Sign Up)
 *   - 'accent': Amber fill (for special actions like Leave Table)
 *   - 'danger': Red fill (for destructive actions like Logout)
 * 
 * Sizes:
 *   - 'sm': Compact (px-3 py-1.5, text-xs)
 *   - 'md': Standard (px-4 py-2, text-sm) - DEFAULT
 *   - 'lg': Large (px-5 py-3, text-base)
 * 
 * Usage:
 *   <Button>Click me</Button>
 *   <Button variant="primary" onClick={handleSignUp}>Sign Up</Button>
 *   <Button variant="danger" icon={LogOut} iconPosition="left">Logout</Button>
 *   <Button as="link" to="/orders" icon={Package}>Orders</Button>
 */
export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  as = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  // Base shared styles
  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  // Variant styles
  const variantClasses = {
    secondary: 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300',
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400',
    accent: 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-300',
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  // Disabled styles
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  // Icon element
  const iconEl = Icon ? <Icon size={18} /> : null;

  // Arrange icon and text based on position
  const content = iconPosition === 'left' ? (
    <>
      {iconEl}
      <span>{children}</span>
    </>
  ) : (
    <>
      <span>{children}</span>
      {iconEl}
    </>
  );

  // Render as different element types
  if (as === 'link') {
    const { to, href, ...restProps } = props;
    return (
      <a href={to || href} className={buttonClasses} {...restProps}>
        {content}
      </a>
    );
  }

  if (as === 'react-link') {
    const { to, ...restProps } = props;
    // Assuming react-router Link is imported in parent if needed
    // This branch is for when parent passes a Link component
    return (
      <a href={to} className={buttonClasses} {...restProps}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {content}
    </button>
  );
}
