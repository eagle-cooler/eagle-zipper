// i18n utility using Eagle's global i18next

declare global {
  const i18next: {
    t: (key: string, options?: { [key: string]: any }) => string;
  };
}

/**
 * Get translated string using Eagle's global i18next
 * @param key Translation key (e.g., 'app.ui.editing.title')
 * @param interpolation Values to interpolate into the translation
 * @returns Translated string
 */
export function t(key: string, interpolation?: { [key: string]: any }): string {
  return i18next.t(key, interpolation);
}