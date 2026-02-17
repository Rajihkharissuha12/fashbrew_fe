// components/ui/Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = false,
  style,
  onClick,
}: CardProps) {
  const baseStyles =
    "rounded-3xl bg-white shadow-lg shadow-black/5 transition-all duration-300";
  const hoverStyles = hover
    ? "hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 cursor-pointer"
    : "";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
