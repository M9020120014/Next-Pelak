import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next PELAK Design System",
  description: "Best design system for your next project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
