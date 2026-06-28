import type { Metadata } from "next";
import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DashboardProvider } from "@/components/DashboardDrawer";

export const metadata: Metadata = {
  title: "Cofano",
  description: "DeFi risk intelligence for on-chain investors.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#0f0f0f]">
        <DashboardProvider>
          <NavBar />
          {children}
          {modal}
          <Footer />
        </DashboardProvider>
      </body>
    </html>
  );
}
