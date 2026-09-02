"use client";

import { usePathname } from "next/navigation";
import { StaffThemeProvider } from "@/components/StaffThemeProvider";
import StaffThemeControl from "@/components/StaffThemeControl";

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const showThemeControl =
    pathname === "/staff" ||
    pathname.startsWith("/staff/applications/");

  return (
    <StaffThemeProvider>
      {children}

      {showThemeControl && <StaffThemeControl />}
    </StaffThemeProvider>
  );
}
