"use client";

import { usePathname } from "next/navigation";
import CEOBriefFloat from "@/components/ui/CEOBrief";
import ChatWidget from "@/components/ui/ChatWidget";

export default function FloatingWidgets() {
  const pathname = usePathname();
  if (pathname === "/presentation") return null;
  return (
    <>
      <CEOBriefFloat />
      <ChatWidget />
    </>
  );
}
