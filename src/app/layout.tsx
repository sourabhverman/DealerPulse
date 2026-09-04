import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import ChatWidget from "@/components/ui/ChatWidget";
import CEOBriefFloat from "@/components/ui/CEOBrief";
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
          <main className="ml-56 min-h-screen">
            {children}
          </main>
          <CEOBriefFloat />
          <ChatWidget />
        </FilterProvider>
      </body>
    </html>
  );
}
