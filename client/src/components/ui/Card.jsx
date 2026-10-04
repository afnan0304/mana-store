import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-lg border border-slate-200/80 shadow-sm overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-base font-semibold text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-slate-500 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={`px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
