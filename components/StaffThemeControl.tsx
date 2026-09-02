"use client";

import { useStaffTheme } from "@/components/StaffThemeProvider";

export default function StaffThemeControl() {
  const { theme, setTheme } = useStaffTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-400 shadow-lg backdrop-blur transition hover:border-white/20 hover:bg-white/5 hover:text-white">
          <span>Appearance</span>
          <span className="text-xs">⌄</span>
        </summary>

        <div className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 p-1 shadow-2xl">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
              theme === "dark"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Dark
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
              theme === "light"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Light
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
              theme === "system"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            System
          </button>
        </div>
      </details>
    </div>
  );
}
