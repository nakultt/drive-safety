import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AlertCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  imageUrl?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const AlertCard: React.FC<AlertCardProps> = ({
  icon: Icon,
  title,
  description,
  severity,
  timestamp,
  imageUrl,
  actionButton
}) => {
  const severityStyles = {
    low: 'bg-blue-50 border-blue-200 text-blue-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-red-50 border-red-200 text-red-700'
  };

  const severityBg = {
    low: 'bg-blue-100',
    medium: 'bg-amber-100',
    high: 'bg-red-100'
  };

  return (
    <div className={`rounded-2xl border-2 p-4 ${severityStyles[severity]} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className={`${severityBg[severity]} rounded-lg p-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm">{title}</h4>
            </div>
          </div>
          <p className="text-sm opacity-90 mb-2 break-words">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">{timestamp}</span>
            {actionButton && (
              <button
                onClick={actionButton.onClick}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-white/50 hover:bg-white transition-colors duration-200"
              >
                {actionButton.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
