"use client";

import { useEffect } from "react";
import { playClickSound } from "@/lib/sounds";

export function GlobalSound() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Play sound if a button, link, or input is clicked
      if (
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.tagName === "A" ||
        target.closest("a") ||
        target.tagName === "INPUT"
      ) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleGlobalClick, true);

    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, []);

  return null;
}
