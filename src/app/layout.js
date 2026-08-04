import "./globals.css";

export const metadata = {
  title: "Member Mate",
  description: "Member Mate App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}