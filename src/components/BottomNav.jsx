"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserPlus, Users } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { colors } = useTheme();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/add-student", label: "Add Student", icon: UserPlus },
    { href: "/dashboard/students", label: "Students", icon: Users },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex border-t transition-colors duration-200"
      style={{ background: colors.surface, borderColor: colors.border }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium"
            style={{ color: active ? colors.primary : colors.textMuted }}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}