export type ThemePreference = "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "agent-mesh-theme";

/** Brand-first default: premium dark platform. */
export const DEFAULT_THEME: ThemePreference = "dark";

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "light" || value === "dark";
}

/** Map legacy "auto" (and anything else) to a concrete light/dark choice. */
function coercePreference(raw: string | null | undefined): ThemePreference {
  if (raw === "light" || raw === "dark") return raw;
  return DEFAULT_THEME;
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return coercePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference;
}

/** Apply theme attributes on <html> and persist the choice. */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* private mode */
  }
  return resolved;
}

/** Inline boot script — keep in sync with applyTheme / storage key / DEFAULT_THEME. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_THEME)};var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"){p=d;try{localStorage.setItem(k,p);}catch(e){}}var r=document.documentElement;r.dataset.theme=p;r.dataset.themePreference=p;r.style.colorScheme=p;}catch(e){var r2=document.documentElement;r2.dataset.theme=${JSON.stringify(DEFAULT_THEME)};r2.style.colorScheme=${JSON.stringify(DEFAULT_THEME)};}})();`;
