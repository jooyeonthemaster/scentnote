import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap font-mono text-sm font-medium",
    "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    "border border-lab-gray-300 hover:border-lab-gray-400 active:border-lab-black",
    "transform hover:translate-y-[-1px] active:translate-y-[0px] transition-transform duration-150"
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-lab-white text-lab-black",
          "hover:bg-lab-gray-100 active:bg-lab-gray-200"
        ],
        primary: [
          "bg-lab-black text-lab-white border-lab-black",
          "hover:bg-lab-gray-800 active:bg-lab-gray-900"
        ],
        secondary: [
          "bg-lab-gray-100 text-lab-gray-700",
          "hover:bg-lab-gray-200 active:bg-lab-gray-300"
        ],
        outline: [
          "border-2 border-lab-black bg-transparent text-lab-black",
          "hover:bg-lab-black hover:text-lab-white"
        ],
        ghost: [
          "border-none bg-transparent text-lab-gray-600",
          "hover:bg-lab-gray-100 hover:text-lab-black"
        ],
        link: [
          "border-none bg-transparent text-lab-black underline-offset-4",
          "hover:underline"
        ]
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 