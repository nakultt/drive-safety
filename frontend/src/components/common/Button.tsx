// Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export default function Button({ className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
