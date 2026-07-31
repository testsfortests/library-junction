import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DashboardBackground from "@/components/DashboardBackground";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <DashboardBackground>
        <Header />
        <main className="px-4 pb-24 pt-20">{children}</main>
        <BottomNav />
      </DashboardBackground>
    </ThemeProvider>
  );
}