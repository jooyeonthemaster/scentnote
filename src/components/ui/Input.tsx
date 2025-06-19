import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          [
            "flex h-10 w-full border border-lab-gray-300 bg-lab-white px-3 py-2",
            "font-mono text-sm ring-offset-background file:border-0 file:bg-transparent",
            "file:text-sm file:font-medium placeholder:text-lab-gray-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-gray-400",
            "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "rounded-none transition-colors hover:border-lab-gray-400",
            "bg-grid-paper bg-grid relative",
            "before:absolute before:inset-0 before:bg-lab-white/90 before:pointer-events-none",
            "relative z-10"
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input }; 