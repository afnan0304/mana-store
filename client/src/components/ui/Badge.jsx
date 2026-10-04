import React from 'react';

const badgeVariants = {
  // Semantic operational statuses
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  issued: 'bg-sky-50 text-sky-700 border-sky-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  under_maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  damaged: 'bg-red-100 text-red-800 border-red-300',
  lost: 'bg-red-100 text-red-800 border-red-300',
  retired: 'bg-slate-100 text-slate-600 border-slate-300',

  // General semantic variants
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  brand: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const dotColors = {
  available: 'bg-emerald-500',
  issued: 'bg-sky-500',
  overdue: 'bg-rose-500',
  maintenance: 'bg-amber-500',
  under_maintenance: 'bg-amber-500',
  damaged: 'bg-red-500',
  lost: 'bg-red-500',
  retired: 'bg-slate-400',

  success: 'bg-emerald-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  brand: 'bg-indigo-500',
  neutral: 'bg-slate-400',
};

const badgeSizes = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs font-medium',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
  ...props
}) => {
  const normVariant = (variant || 'neutral').toLowerCase();
  const variantClass = badgeVariants[normVariant] || badgeVariants.neutral;
  const dotClass = dotColors[normVariant] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${variantClass} ${
        badgeSizes[size] || badgeSizes.sm
      } ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass}`} />}
      {children}
    </span>
  );
};

export default Badge;
