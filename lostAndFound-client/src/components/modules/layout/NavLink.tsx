"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  end?: boolean;
  onClick?: () => void;
  className?: string | ((state: { isActive: boolean }) => string);
  children?: React.ReactNode | ((state: { isActive: boolean }) => React.ReactNode);
  "aria-label"?: string;
}

export function NavLink({
  to,
  end = false,
  onClick,
  className,
  children,
  ...rest
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname.startsWith(to);

  return (
    <Link
      href={to}
      onClick={onClick}
      className={typeof className === "function" ? cn(className({ isActive })) : className}
      aria-current={isActive ? "page" : undefined}
      {...rest}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  );
}
