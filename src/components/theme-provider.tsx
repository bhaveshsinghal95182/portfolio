"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/**
 * next-themes drives the theme (the Messy UI toggle expects it) and writes to
 * the same data-theme attribute the stylesheet keys off. It also injects its
 * own no-flash script, so the layout does not need one.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Thin adapter so the palette and terminal keep a stable, typed API. */
export function useTheme(): ThemeContextValue {
  const { theme, resolvedTheme, setTheme } = useNextTheme();
  const resolved: ResolvedTheme = resolvedTheme === "dark" ? "dark" : "light";

  return {
    theme: (theme as Theme) ?? "system",
    resolvedTheme: resolved,
    setTheme: (next: Theme) => setTheme(next),
    toggleTheme: () => setTheme(resolved === "dark" ? "light" : "dark"),
  };
}
