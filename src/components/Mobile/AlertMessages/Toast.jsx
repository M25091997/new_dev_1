import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close after duration
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-600',
          iconColor: 'text-white',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-600',
          iconColor: 'text-white',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-600',
          iconColor: 'text-white',
          textColor: 'text-white'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-gray-800',
          iconColor: 'text-white',
          textColor: 'text-white'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      onClick={handleClose}
      className={`
        fixed bottom-20 left-4 right-4 z-50
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
        }
      `}
    >
      <div className={`
        ${config.bgColor} 
        rounded-xl shadow-2xl
        px-4 py-3
        backdrop-blur-sm bg-opacity-95
      `}>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-semibold ${config.textColor} leading-tight`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`text-xs ${config.textColor} opacity-90 leading-tight ${title ? 'mt-0.5' : ''}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
