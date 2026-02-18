// Badge.tsx
import { ReactNode } from 'react';

interface BadgeProps {
  color: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'default';
  children: ReactNode;
}

const colorMap = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-indigo-500 text-white',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-500 text-white',
  danger: 'bg-red-500 text-white',
  default: 'bg-gray-200 text-gray-800',
};

export default function Badge({ color, children }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorMap[color]}`}>{children}</span>
  );
}
