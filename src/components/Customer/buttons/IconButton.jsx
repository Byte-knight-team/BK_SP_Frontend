import React from 'react';

/**
 * IconButton: Compact icon-only button for actions like cart, menu toggle.
 * 
 * Variants: 'secondary' (default), 'primary', 'accent', 'danger'
 * Size: 'sm' (8x8), 'md' (10x10), 'lg' (12x12) - DEFAULT
 * 
 * Usage:
 *   <IconButton icon={ShoppingBag} aria-label="Open cart" />
 *   <IconButton variant="primary" icon={Plus} onClick={handleAdd} />
 */
export default function IconButton({
  icon: Icon,
  variant = 'secondary',
  size = 'lg',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    secondary: 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300',
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400',
    accent: 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-300',
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-10 w-10',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} />}
    </button>
  );
}
