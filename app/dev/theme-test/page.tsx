'use client';

import { ThemeSettingsStub } from '@/components/layout/ThemeSettingsStub';
import { useTheme } from '@/lib/theme/ThemeProvider';

// ─── Color Swatch Grid ────────────────────────────────────────────────────────

const TOKEN_SWATCHES = [
  { name: '--bg-base',                 tailwind: 'bg-bg-base',                border: true  },
  { name: '--bg-surface',              tailwind: 'bg-bg-surface',             border: true  },
  { name: '--bg-elevated',             tailwind: 'bg-bg-elevated',            border: false },
  { name: '--text-primary',            tailwind: 'bg-text-primary',           border: false },
  { name: '--text-muted',              tailwind: 'bg-text-muted',             border: false },
  { name: '--accent-primary',          tailwind: 'bg-accent-primary',         border: false },
  { name: '--accent-secondary',        tailwind: 'bg-accent-secondary',       border: false },
  { name: '--accent-primary-hover',    tailwind: 'bg-accent-primary-hover',   border: false },
  { name: '--accent-secondary-hover',  tailwind: 'bg-accent-secondary-hover', border: false },
  { name: '--border-default',          tailwind: 'bg-border-default',         border: false },
  { name: '--border-interactive',      tailwind: 'bg-border-interactive',     border: false },
  { name: '--state-error',             tailwind: 'bg-state-error',            border: false },
  { name: '--state-success',           tailwind: 'bg-state-success',          border: false },
  { name: '--state-warning',           tailwind: 'bg-state-warning',          border: false },
] as const;

// ─── Active Badge ─────────────────────────────────────────────────────────────

function ThemeBadge() {
  const { color, mode, motion } = useTheme();
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary text-text-primary border border-border-interactive">
        {color.charAt(0).toUpperCase() + color.slice(1)} Theme
      </span>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-elevated text-text-primary border border-border-default">
        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
      </span>
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-elevated text-text-primary border border-border-default">
        Motion: {motion.charAt(0).toUpperCase() + motion.slice(1)}
      </span>
    </div>
  );
}

// ─── Animation Demo ───────────────────────────────────────────────────────────

function AnimationDemo() {
  return (
    <div className="p-6 rounded-2xl border border-border-default bg-bg-surface space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Animation Demo</h3>
      <p className="text-sm text-text-muted">
        Hover the card below. With &quot;Reduced&quot; motion active, the lift is
        near-instant and signature animations are suppressed.
      </p>
      <div
        className={[
          'p-4 rounded-xl border border-border-default bg-bg-elevated cursor-pointer select-none text-sm font-medium text-text-primary',
          // Standard lift — suppressed by .reduce-motion in globals.css
          'transition-[transform,box-shadow] duration-200 ease-out',
          'hover:-translate-y-0.5 hover:shadow-md',
        ].join(' ')}
      >
        Hover me — Clay Lift Demo
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ThemeTestPage() {
  return (
    <div className="p-8 min-h-screen bg-bg-base text-text-primary transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-10 pb-32">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            Design Tokens Verification
          </h1>
          <p className="text-text-muted">
            Use the settings panel (bottom-right) to switch themes, modes, and motion.
            All changes persist via <code className="font-mono text-xs bg-bg-elevated px-1 py-0.5 rounded">localStorage</code>.
          </p>
          <ThemeBadge />
        </div>

        {/* Color Swatches */}
        <section aria-labelledby="swatches-heading" className="space-y-4">
          <h2 id="swatches-heading" className="text-2xl font-semibold text-text-primary">
            Active Color Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {TOKEN_SWATCHES.map((token) => (
              <div
                key={token.name}
                className="flex flex-col rounded-2xl overflow-hidden border border-border-default bg-bg-surface shadow-sm"
              >
                <div
                  className={`h-20 ${token.tailwind} ${
                    token.border ? 'border-b border-border-default' : ''
                  } transition-colors duration-200`}
                />
                <div className="p-3 bg-bg-surface">
                  <p className="font-mono text-xs font-semibold text-text-primary break-all">
                    {token.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Component Demos */}
        <section aria-labelledby="components-heading" className="space-y-4">
          <h2 id="components-heading" className="text-2xl font-semibold text-text-primary">
            Interactive Previews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Border types */}
            <div className="p-6 rounded-2xl border border-border-default bg-bg-surface space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Border Types</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Decorative Border (Soft — card outlines)
                  </label>
                  <div className="h-10 rounded-xl border border-border-default bg-bg-base flex items-center px-3 text-sm text-text-muted">
                    Card / divider use
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="interactive-border-demo"
                    className="block text-xs font-medium text-text-muted mb-1"
                  >
                    Interactive Border (Higher contrast — inputs)
                  </label>
                  <input
                    id="interactive-border-demo"
                    type="text"
                    defaultValue="Text input with --border-interactive"
                    className="w-full h-10 rounded-xl border border-border-interactive bg-bg-base px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-colors duration-150"
                  />
                </div>
              </div>
            </div>

            {/* State colors */}
            <div className="p-6 rounded-2xl border border-border-default bg-bg-surface space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">State Feedback</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-bg-elevated border border-state-success text-state-success text-sm font-semibold" role="status">
                  ✅ Success — Action completed successfully.
                </div>
                <div className="p-3 rounded-xl bg-bg-elevated border border-state-warning text-state-warning text-sm font-semibold" role="status">
                  ⚠️ Warning — Check your settings.
                </div>
                <div className="p-3 rounded-xl bg-bg-elevated border border-state-error text-state-error text-sm font-semibold" role="alert">
                  ❌ Error — Unable to save changes.
                </div>
              </div>
            </div>

            {/* Animation demo */}
            <AnimationDemo />

            {/* Typography scale */}
            <div className="p-6 rounded-2xl border border-border-default bg-bg-surface space-y-3">
              <h3 className="text-lg font-semibold text-text-primary">Typography Scale</h3>
              <p style={{ fontSize: '48px', lineHeight: '52px' }} className="font-[var(--font-heading)] text-text-primary">Hero 48px</p>
              <p style={{ fontSize: '32px', lineHeight: '38px' }} className="font-[var(--font-heading)] text-text-primary">Section 32px</p>
              <p style={{ fontSize: '22px', lineHeight: '28px', fontWeight: 600 }} className="text-text-primary">Card Title 22px</p>
              <p style={{ fontSize: '16px', lineHeight: '24px' }} className="text-text-primary">Body 16px — Nunito Sans</p>
              <p style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 500 }} className="text-text-muted">Label / Small 14px</p>
              <p style={{ fontSize: '12px', lineHeight: '16px' }} className="text-text-muted">Caption 12px</p>
            </div>
          </div>
        </section>

      </div>

      {/* Floating settings panel */}
      <ThemeSettingsStub />
    </div>
  );
}
