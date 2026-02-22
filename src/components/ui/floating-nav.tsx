"use client";
import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export const FloatingNav = ({
  navItems,
  className,
  startContent,
  endContent,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }[];
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}) => {
  const { scrollYProgress } = useScroll();
  const location = useLocation();

  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "fixed top-4 inset-x-0 mx-auto z-[5000]",
          "w-[calc(100%-2rem)] max-w-4xl",
          "flex items-center justify-between",
          "px-4 py-3 sm:px-6",
          "rounded-2xl",
          "bg-gray-950/70 backdrop-blur-xl backdrop-saturate-150",
          "border border-white/[0.08]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]",
          className
        )}
      >
        {/* Left: Logo */}
        {startContent}

        {/* Center: Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.map((navItem, idx) => {
            const isActive = location.pathname === navItem.link;
            return (
              <Link
                key={`nav-${idx}`}
                to={navItem.link}
                onClick={navItem.onClick}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-amber-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.06]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {navItem.icon}
                  <span className="hidden sm:inline">{navItem.name}</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right: End Content */}
        {endContent}
      </motion.nav>
    </AnimatePresence>
  );
};
