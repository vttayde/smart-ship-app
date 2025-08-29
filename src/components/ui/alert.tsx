import React from 'react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export function Alert({ className = '', variant = 'default', children, ...props }: AlertProps) {
  const variantClasses = {
    default: 'border-gray-200 bg-gray-50 text-gray-900',
    destructive: 'border-red-200 bg-red-50 text-red-900'
  };

  return (
    <div
      className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function AlertDescription({ className = '', children, ...props }: AlertDescriptionProps) {
  return (
    <div
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
