"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const ShimmerButton = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={cn(
        "inline-flex h-12 animate-shimmer items-center justify-center rounded-md",
        "border border-gold-subtle",
        "bg-[linear-gradient(110deg,#0B0F14_45%,rgba(245,158,11,0.35)_55%,#111827_100%)] bg-[length:200%_100%]",
        "px-6 font-semibold text-white",
        "shadow-gold transition-all",
        "hover:brightness-110 hover:shadow-gold-lg",
        "active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-gold-primary focus:ring-offset-2 focus:ring-offset-black-primary",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
