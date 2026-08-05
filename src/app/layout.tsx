import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Cheque Reminder",
  description: "Never miss a cheque again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
