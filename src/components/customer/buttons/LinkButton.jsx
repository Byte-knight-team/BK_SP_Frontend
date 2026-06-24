import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LinkButton: Button component that works with react-router Link.
 * Inherits all Button variants and sizing.
 * 
 * Usage:
 *   <LinkButton to="/orders" icon={Package}>Orders</LinkButton>
 *   <LinkButton variant="primary" to="/signup">Sign Up</LinkButton>
 */
export default function LinkButton({
  children,
  to,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variantClasses = {
    secondary: 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300',
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-400',
    accent: 'bg-amber-100 text-amber-700 hover:bg-amber-200 focus-visible:ring-amber-300',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const linkClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const iconEl = Icon ? <Icon size={18} /> : null;

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

  return (
    <Link to={to} className={linkClasses} {...props}>
      {content}
    </Link>
  );
}
