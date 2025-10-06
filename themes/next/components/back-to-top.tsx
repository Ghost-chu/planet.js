"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") {
        return;
      }
      setIsVisible(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-label="Back to top"
    >
      ↑
    </Button>
  );
}
