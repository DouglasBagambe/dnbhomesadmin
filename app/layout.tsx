import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./launch.css";

export const metadata: Metadata = {
  title: "dnb Homes Command Center",
  description: "Secure operations console for dnb Homes listings and viewing requests.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#101827"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
