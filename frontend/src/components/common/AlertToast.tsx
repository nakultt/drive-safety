// AlertToast.tsx
import { ReactNode } from 'react';

interface AlertToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: ReactNode;
}

const typeMap = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-gray-800',
  info: 'bg-blue-600 text-white',
};

export default function AlertToast({ type, message }: AlertToastProps) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-xl shadow-sm font-semibold ${typeMap[type]}`}>{message}</div>
  );
}
