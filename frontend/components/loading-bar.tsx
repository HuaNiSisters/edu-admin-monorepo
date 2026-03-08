"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

type LoadingBarProps = {
  isLoading: boolean;
};

export function LoadingBar({ isLoading }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(0);

      let elapsed = 0;
      const interval = setInterval(() => {
        elapsed += 100;
        const next = 90 * (1 - 1 / (1 + Math.log1p(elapsed / 400)));
        setProgress(next);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(100);
      const hide = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      return () => clearTimeout(hide);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] rounded-none bg-transparent"
    />
  );
}
