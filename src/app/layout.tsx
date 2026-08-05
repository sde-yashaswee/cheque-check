import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ChequeCheck",
  description: "Never miss a cheque again.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-primary font-sans text-foreground selection:bg-primary/10 antialiased flex items-center justify-center min-h-[100dvh] overflow-hidden">
        
        {/* Mock Phone Container: Centered on large screens, full screen on mobile */}
        <div className="relative w-full h-[100dvh] bg-background sm:h-[90dvh] sm:max-h-[932px] sm:max-w-[430px] sm:rounded-xl sm:border-[4px] sm:border-white sm:shadow-2xl overflow-hidden flex flex-col [transform:translateZ(0)]">
          <Providers>
            {/* Inner Scrollable Area: All content scrolls inside here */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col">
              {children}
            </div>
          </Providers>
        </div>

        {/* Landscape Warning Overlay: Visible only on mobile landscape devices */}
        <div className="hidden [@media(orientation:landscape)_and_(max-height:600px)]:flex fixed inset-0 z-[9999] bg-zinc-950 flex-col items-center justify-center text-center p-6 text-white">
          <div className="mb-6 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90">
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Please Rotate Your Device</h2>
          <p className="text-zinc-400">This app is designed to be used in portrait mode.</p>
        </div>
      </body>
    </html>
  );
}
