/**
 * ThemeScript — server-rendered inline script that sets data-theme, .dark,
 * and .reduce-motion on <html> synchronously before the first paint.
 *
 * Must be rendered as a Server Component and placed inside <head>.
 * Never add `'use client'` — this file has no client runtime.
 */

const themeInitCode = `(function () {
  try {
    var color  = localStorage.getItem('theme-color');
    var mode   = localStorage.getItem('theme-mode');
    var motion = localStorage.getItem('theme-motion');

    // --- Color theme default: blue ---
    if (color !== 'blue' && color !== 'pink') {
      color = 'blue';
    }

    // --- Mode default: system preference ---
    if (mode !== 'light' && mode !== 'dark') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // --- Motion default: system preference ---
    if (motion !== 'normal' && motion !== 'reduced') {
      motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'normal';
    }

    var html = document.documentElement;
    html.setAttribute('data-theme', color);

    if (mode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    if (motion === 'reduced') {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }
  } catch (e) {
    // localStorage unavailable (e.g. private browsing) — defaults stay
  }
})();`;

/**
 * Renders the blocking theme-init script into <head>.
 * The script has no `defer` or `async` so it runs synchronously and
 * classes/attributes land on <html> before the browser draws anything.
 */
export function ThemeScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional — theme init must run inline & synchronously
      dangerouslySetInnerHTML={{ __html: themeInitCode }}
    />
  );
}
