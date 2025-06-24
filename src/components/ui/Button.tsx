import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'mono' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  const variantClasses = {
    primary: 'mono-button',
    secondary: 'bg-mono-200 hover:bg-mono-300 text-mono-900 hover:shadow-soft active:scale-95',
    ghost: 'bg-transparent hover:bg-glass-white text-mono-600 hover:text-mono-900 hover:shadow-soft',
    mono: 'bg-gradient-accent text-white hover:shadow-accent hover:scale-105 active:scale-95',
    glass: 'bg-glass-white backdrop-blur-sm border border-glass-border text-mono-900 hover:bg-glass-light hover:shadow-glass-light',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-4 py-2 rounded-lg',
    md: 'text-base px-6 py-3 rounded-xl',
    lg: 'text-lg px-8 py-4 rounded-xl',
    xl: 'text-xl px-10 py-5 rounded-2xl',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button }; 