import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dnb Homes Command Center",
  description: "Secure management console for dnb Homes properties and appointments.",
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
