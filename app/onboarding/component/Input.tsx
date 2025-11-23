"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-neutral-900">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            bg-white text-neutral-900 placeholder-neutral-500
            focus:outline-none focus:ring-0
            ${
              hasError
                ? "border-red-300 focus:border-red-500 bg-red-50"
                : "border-neutral-200 focus:border-orange-500 hover:border-neutral-300"
            }
            disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {hint && !hasError && (
          <p className="text-xs text-neutral-500">{hint}</p>
        )}
        {hasError && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
