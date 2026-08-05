import "./globals.css";

export const metadata = {
  title: "Member Mate",
  description: "Member Mate App",
  manifest: "/manifest.json",
  themeColor: "#00ff00",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons-180.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}