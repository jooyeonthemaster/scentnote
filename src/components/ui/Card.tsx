import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          "rounded-none border border-lab-gray-300 bg-lab-paper text-lab-black",
          "shadow-sm transition-shadow hover:shadow-md",
          "bg-grid-paper bg-grid relative",
          "before:absolute before:inset-0 before:bg-lab-paper/80 before:pointer-events-none"
        ],
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          "flex flex-col space-y-1.5 p-6 pb-4 relative z-10",
          "border-b border-lab-gray-200 border-dashed"
        ],
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        [
          "font-mono text-lg font-semibold leading-none tracking-tight",
          "text-lab-black"
        ],
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        [
          "font-mono text-sm text-lab-gray-600",
          "leading-relaxed"
        ],
        className
      )}
      {...props}
    />
  )
);

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-4 relative z-10", className)}
      {...props}
    />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        [
          "flex items-center p-6 pt-0 relative z-10",
          "border-t border-lab-gray-200 border-dashed mt-4"
        ],
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
 