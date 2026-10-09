"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
type Theme = "system" | "light" | "dark";
export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let choice: Theme = "system";
    try {
      const saved = localStorage.getItem("homes-admin-theme");
      if (saved === "light" || saved === "dark") choice = saved;
    } catch {}
    const apply = () => {
      document.documentElement.dataset.theme =
        choice === "system" ? (media.matches ? "dark" : "light") : choice;
    };
    queueMicrotask(() => setTheme(choice));
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return (
    <label className="theme-control">
      <span>Theme</span>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => {
          const value = e.target.value as Theme;
          try {
            localStorage.setItem("homes-admin-theme", value);
          } catch {}
          setTheme(value);
          document.documentElement.dataset.theme =
            value === "system"
              ? matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
              : value;
        }}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <Image className="mark-on-light" src="/brand/logo-light.svg" width={499} height={499} alt="" />
        <Image className="mark-on-dark" src="/brand/logo-dark.svg" width={499} height={499} alt="" />
      </span>
      <div>
        <strong>HOMES</strong>
        <span>Operations</span>
      </div>
    </div>
  );
}
