import "./globals.css";

export const metadata = {
  title: "Member Junction",
  description: "Member Junction App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}