"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Palette } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { SIGN_IN_URL } from "@/lib/clerk/config";
import { useTheme, type ThemeColor, type ThemeMode, type ThemeMotion } from "@/lib/theme/ThemeProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function SwatchButton({ value, active, onClick, label, swatchBg }: {
  value: ThemeColor; active: boolean; onClick: () => void; label: string; swatchBg: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Switch to ${label} theme`}
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer",
        active
          ? "border-border-interactive bg-bg-elevated text-text-primary shadow-sm"
          : "border-border-default bg-bg-base text-text-muted hover:bg-bg-elevated",
      ].join(" ")}
    >
      <span className="inline-block w-4 h-4 rounded-full shrink-0" style={{ background: swatchBg }} aria-hidden="true" />
      {label}
    </button>
  );
}

function ToggleButton({ active, onClick, label, icon }: {
  active: boolean; onClick: () => void; label: string; icon: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={[
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer",
        active
          ? "border-border-interactive bg-bg-elevated text-text-primary shadow-sm"
          : "border-border-default bg-bg-base text-text-muted hover:bg-bg-elevated",
      ].join(" ")}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

function ThemeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { color, mode, motion, setColor, setMode, setMotion } = useTheme();
  const [draft, setDraft] = useState<{ color: ThemeColor; mode: ThemeMode; motion: ThemeMotion }>({
    color, mode, motion,
  });

  function handleOpen(isOpen: boolean) {
    if (isOpen) setDraft({ color, mode, motion });
    else onClose();
  }

  function handleSave() {
    setColor(draft.color);
    setMode(draft.mode);
    setMotion(draft.motion);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Theme Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-muted">Color</span>
            <div className="flex gap-2">
              <SwatchButton value="blue" active={draft.color === "blue"} onClick={() => setDraft((d) => ({ ...d, color: "blue" }))} label="Blue" swatchBg="#a8d8ea" />
              <SwatchButton value="pink" active={draft.color === "pink"} onClick={() => setDraft((d) => ({ ...d, color: "pink" }))} label="Pink" swatchBg="#f4c2c2" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-muted">Mode</span>
            <div className="flex gap-2">
              <ToggleButton active={draft.mode === "light"} onClick={() => setDraft((d) => ({ ...d, mode: "light" }))} label="Light" icon="☀️" />
              <ToggleButton active={draft.mode === "dark"} onClick={() => setDraft((d) => ({ ...d, mode: "dark" }))} label="Dark" icon="🌙" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-text-muted">Motion</span>
            <div className="flex gap-2">
              <ToggleButton active={draft.motion === "normal"} onClick={() => setDraft((d) => ({ ...d, motion: "normal" }))} label="Normal" icon="✨" />
              <ToggleButton active={draft.motion === "reduced"} onClick={() => setDraft((d) => ({ ...d, motion: "reduced" }))} label="Reduced" icon="⏸" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function NavAccountButton() {
  const { isSignedIn } = useUser();
  const [themeOpen, setThemeOpen] = useState(false);

  if (isSignedIn) {
    return (
      <>
        <div className="inline-flex items-center justify-center h-[44px] w-[44px]">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="Theme Settings"
                labelIcon={<Palette size={16} />}
                onClick={() => setThemeOpen(true)}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
        <ThemeDialog open={themeOpen} onClose={() => setThemeOpen(false)} />
      </>
    );
  }

  return (
    <Link
      href={SIGN_IN_URL}
      className="inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
      aria-label="Sign In"
    >
      <User className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}
