import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";
import FloatingWidgets from "@/components/layout/FloatingWidgets";
import { FilterProvider } from "@/context/FilterContext";

export const metadata: Metadata = {
  title: "DealerPulse — Toyota Dealership Dashboard",
  description: "Real-time dealership performance analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">
        <FilterProvider>
          <Sidebar />
          <MainContent>{children}</MainContent>
          <FloatingWidgets />
        </FilterProvider>
      </body>
    </html>
  );
}
