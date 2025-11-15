"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle2,
      iconColor: "text-green-600",
      textColor: "text-green-800",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: AlertCircle,
      iconColor: "text-red-600",
      textColor: "text-red-800",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
    },
  };

  const { bg, border, icon: Icon, iconColor, textColor } = config[type];

  return (
    <div
      className={`
        ${bg} ${border} border rounded-lg p-4 flex items-start gap-3
        shadow-lg animate-in slide-in-from-top-2 fade-in duration-300
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
