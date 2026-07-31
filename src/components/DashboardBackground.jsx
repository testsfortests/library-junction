"use client";

import { useTheme } from "@/context/ThemeContext";

export default function DashboardBackground({ children }) {
  const { colors } = useTheme();
  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: colors.bg }}>
      {children}
    </div>
  );
}