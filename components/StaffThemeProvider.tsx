"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light" | "system";

type StaffThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const StaffThemeContext = createContext<
  StaffThemeContextType | undefined
>(undefined);

const STORAGE_KEY = "prospherum-staff-theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function StaffThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] =
    useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (
      saved === "dark" ||
      saved === "light" ||
      saved === "system"
    ) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const resolved =
        theme === "system" ? getSystemTheme() : theme;

      setResolvedTheme(resolved);

      document.documentElement.dataset.staffTheme = resolved;
    };

    applyTheme();

    if (theme !== "system") return;

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", applyTheme);

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <StaffThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
      }}
    >
      {children}
    </StaffThemeContext.Provider>
  );
}

export function useStaffTheme() {
  const context = useContext(StaffThemeContext);

  if (!context) {
    throw new Error(
      "useStaffTheme must be used inside StaffThemeProvider"
    );
  }

  return context;
}
