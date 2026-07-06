'use client';

import { useTheme, type ThemeColor, type ThemeMode, type ThemeMotion } from '@/lib/theme/ThemeProvider';

// ─── Swatch Button ────────────────────────────────────────────────────────────

function SwatchButton({
  value,
  active,
  onClick,
  label,
  swatchBg,
}: {
  value: ThemeColor;
  active: boolean;
  onClick: () => void;
  label: string;
  swatchBg: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Switch to ${label} theme`}
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer',
        active
          ? 'border-border-interactive bg-bg-elevated text-text-primary shadow-sm'
          : 'border-border-default bg-bg-base text-text-muted hover:bg-bg-elevated',
      ].join(' ')}
    >
      <span
        className="inline-block w-4 h-4 rounded-full shrink-0"
        style={{ background: swatchBg }}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

// ─── Toggle Button ────────────────────────────────────────────────────────────

function ToggleButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer',
        active
          ? 'border-border-interactive bg-bg-elevated text-text-primary shadow-sm'
          : 'border-border-default bg-bg-base text-text-muted hover:bg-bg-elevated',
      ].join(' ')}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

// ─── ThemeSettingsStub ────────────────────────────────────────────────────────

/**
 * Sticky developer settings panel for testing theme variants.
 * Place this inside /dev/theme-test or a dev-only sidebar.
 */
export function ThemeSettingsStub() {
  const { color, mode, motion, setColor, setMode, setMotion } = useTheme();

  return (
    <aside
      role="complementary"
      aria-label="Theme settings"
      className={[
        'fixed bottom-6 right-6 z-50',
        'flex flex-col gap-4 p-4',
        'rounded-2xl border border-border-default bg-bg-surface',
        'shadow-clay-lg',
        'w-[200px]',
      ].join(' ')}
    >
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
        Theme Settings
      </p>

      {/* ── Color Theme ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-text-muted">Color</span>
        <div className="flex flex-col gap-1.5">
          <SwatchButton
            value="blue"
            active={color === 'blue'}
            onClick={() => setColor('blue')}
            label="Blue"
            swatchBg="#a8d8ea"
          />
          <SwatchButton
            value="pink"
            active={color === 'pink'}
            onClick={() => setColor('pink')}
            label="Pink"
            swatchBg="#f4c2c2"
          />
        </div>
      </div>

      {/* ── Mode ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-text-muted">Mode</span>
        <div className="flex flex-col gap-1.5">
          <ToggleButton
            active={mode === 'light'}
            onClick={() => setMode('light')}
            label="Light"
            icon="☀️"
          />
          <ToggleButton
            active={mode === 'dark'}
            onClick={() => setMode('dark')}
            label="Dark"
            icon="🌙"
          />
        </div>
      </div>

      {/* ── Motion ── */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-text-muted">Motion</span>
        <div className="flex flex-col gap-1.5">
          <ToggleButton
            active={motion === 'normal'}
            onClick={() => setMotion('normal')}
            label="Normal"
            icon="✨"
          />
          <ToggleButton
            active={motion === 'reduced'}
            onClick={() => setMotion('reduced')}
            label="Reduced"
            icon="⏸"
          />
        </div>
      </div>
    </aside>
  );
}
