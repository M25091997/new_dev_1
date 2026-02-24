import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 50));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);
    
    // Auto close after duration
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
      clearInterval(progressInterval);
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
          gradient: 'from-green-500 to-emerald-500',
          bgColor: 'bg-white',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-green-500',
          closeButtonColor: 'text-gray-400 hover:text-gray-600',
          shadow: 'shadow-green-100'
        };
      case 'error':
        return {
          icon: XCircle,
          gradient: 'from-red-500 to-rose-500',
          bgColor: 'bg-white',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-red-500',
          closeButtonColor: 'text-gray-400 hover:text-gray-600',
          shadow: 'shadow-red-100'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          gradient: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-white',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-yellow-500',
          closeButtonColor: 'text-gray-400 hover:text-gray-600',
          shadow: 'shadow-yellow-100'
        };
      case 'info':
      default:
        return {
          icon: Info,
          gradient: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-white',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-gray-900',
          messageColor: 'text-gray-600',
          progressColor: 'bg-blue-500',
          closeButtonColor: 'text-gray-400 hover:text-gray-600',
          shadow: 'shadow-blue-100'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 max-w-md w-full
        transform transition-all duration-500 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        ${config.bgColor} 
        rounded-2xl shadow-2xl ${config.shadow} 
        overflow-hidden backdrop-blur-sm
        border border-gray-100
      `}>
        {/* Gradient accent bar */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`}></div>
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon with gradient background */}
            <div className={`flex-shrink-0 ${config.iconBg} rounded-xl p-2.5`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={`text-sm font-semibold ${config.titleColor} mb-0.5`}>
                  {title}
                </h3>
              )}
              {message && (
                <p className={`text-sm ${config.messageColor} leading-relaxed`}>
                  {message}
                </p>
              )}
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 rounded-lg p-1.5 transition-all duration-200
                hover:bg-gray-100 ${config.closeButtonColor}
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div 
            className={`h-full ${config.progressColor} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
