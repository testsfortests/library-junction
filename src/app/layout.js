import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata = {
  title: "Member Mate",
  description: "Member Mate App",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Member Mate",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1B1526" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}