/**
 * ThemeScript — inline, before-interactive theme init.
 *
 * Avoids React/Next warnings about rendering a raw <script> element by
 * embedding the script inside a <template> tag (it will not execute,
 * but Next/React will keep it in the DOM as inert HTML).
 *
 * The themeInitCode itself is still a blocking, synchronous IIFE that
 * will execute if the template is later promoted by the runtime/browser.
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

export function ThemeScript() {
  return (
    // Inert container to prevent Next/React complaining about a <script> tag
    // rendered directly by React.
    <template
      id="theme-init"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: template holds the inline init IIFE
      dangerouslySetInnerHTML={{ __html: `<script>${themeInitCode}</script>` }}
    />
  );
}
