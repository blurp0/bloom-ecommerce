"use client";

import { useEffect, useState } from "react";

export default function ThemeTestPage() {
  const [theme, setTheme] = useState<"blue" | "pink">("blue");
  const [isDark, setIsDark] = useState(false);

  // Sync state with HTML attributes
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, isDark]);

  const colors = [
    { name: "--bg-base", class: "bg-bg-base", border: true },
    { name: "--bg-surface", class: "bg-bg-surface", border: true },
    { name: "--bg-elevated", class: "bg-bg-elevated", border: false },
    { name: "--text-primary", class: "bg-text-primary", border: false },
    { name: "--text-muted", class: "bg-text-muted", border: false },
    { name: "--accent-primary", class: "bg-accent-primary", border: false },
    { name: "--accent-secondary", class: "bg-accent-secondary", border: false },
    { name: "--accent-primary-hover", class: "bg-accent-primary-hover", border: false },
    { name: "--accent-secondary-hover", class: "bg-accent-secondary-hover", border: false },
    { name: "--border-default", class: "bg-border-default", border: false },
    { name: "--border-interactive", class: "bg-border-interactive", border: false },
    { name: "--state-error", class: "bg-state-error", border: false },
    { name: "--state-success", class: "bg-state-success", border: false },
    { name: "--state-warning", class: "bg-state-warning", border: false },
  ];

  return (
    <div className="p-8 min-h-screen bg-bg-base text-text-primary transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Design Tokens Verification</h1>
          <p className="text-text-muted">
            Toggle themes and modes to verify that the CSS custom variables resolve correctly.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-border-interactive bg-bg-surface">
          <div>
            <span className="block text-sm font-medium text-text-muted mb-2">Theme Selection</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("blue")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  theme === "blue"
                    ? "bg-accent-primary text-text-primary border-border-interactive shadow-sm"
                    : "bg-bg-base text-text-primary border-border-default hover:bg-bg-elevated"
                }`}
              >
                Blue Theme
              </button>
              <button
                onClick={() => setTheme("pink")}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  theme === "pink"
                    ? "bg-accent-primary text-text-primary border-border-interactive shadow-sm"
                    : "bg-bg-base text-text-primary border-border-default hover:bg-bg-elevated"
                }`}
              >
                Pink Theme
              </button>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-text-muted mb-2">Mode Selection</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDark(false)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  !isDark
                    ? "bg-accent-secondary text-white border-border-interactive shadow-sm"
                    : "bg-bg-base text-text-primary border-border-default hover:bg-bg-elevated"
                }`}
              >
                Light Mode
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  isDark
                    ? "bg-accent-secondary text-white border-border-interactive shadow-sm"
                    : "bg-bg-base text-text-primary border-border-default hover:bg-bg-elevated"
                }`}
              >
                Dark Mode
              </button>
            </div>
          </div>
        </div>

        {/* Swatch Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Active Color Swatches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div
                key={color.name}
                className="flex flex-col rounded-xl overflow-hidden border border-border-default bg-bg-surface shadow-sm"
              >
                <div
                  className={`h-24 ${color.class} ${
                    color.border ? "border-b border-border-default" : ""
                  } transition-colors duration-200`}
                />
                <div className="p-3 bg-bg-surface">
                  <div className="font-mono text-xs font-semibold text-text-primary">
                    {color.name}
                  </div>
                  <div className="text-xs text-text-muted mt-1 font-mono uppercase">
                    {color.class}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Component Demos to check contrast/borders */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Interactive & Component Previews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soft decorative border vs interactive border */}
            <div className="p-6 rounded-xl border border-border-default bg-bg-surface space-y-4">
              <h3 className="text-lg font-semibold">Border Types</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Decorative Border (Soft, Default)
                  </label>
                  <div className="h-10 rounded-lg border border-border-default bg-bg-base flex items-center px-3 text-sm text-text-muted">
                    Typically used for card outlines or dividers.
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Interactive Border (Affordance, Higher Contrast)
                  </label>
                  <input
                    type="text"
                    defaultValue="Text input with --border-interactive"
                    className="w-full h-10 rounded-lg border border-border-interactive bg-bg-base px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* State Colors */}
            <div className="p-6 rounded-xl border border-border-default bg-bg-surface space-y-4">
              <h3 className="text-lg font-semibold">State Feedback</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-bg-elevated border border-state-success text-state-success text-sm font-semibold">
                  Success Message: Action completed successfully.
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated border border-state-warning text-state-warning text-sm font-semibold">
                  Warning Message: Check your settings.
                </div>
                <div className="p-3 rounded-lg bg-bg-elevated border border-state-error text-state-error text-sm font-semibold">
                  Error Message: Unable to save changes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
