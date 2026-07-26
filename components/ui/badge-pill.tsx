import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  className?: string;
  text?: string;
}

const colorMap: Record<string, string> = {
  HOT: "#C07630",
  TOP: "#8B5E2F",
  NEW: "#7A8C6A",
  SALE: "#A84B2F",
  "30% OFF": "#A84B2F",
};

export const BadgePill: React.FC<Props> = ({
  className,
  text = "TOP",
}) => {
  return (
    <span
      className={cn("font-body text-cream px-1.5 py-px rounded-sm leading-none", className)}
      style={{
        fontSize: "0.58rem",
        background: colorMap[text] ?? "#8B5E2F",
        letterSpacing: "0.04em",
        fontWeight: 700,
      }}
    >
      {text}
    </span>
  );
};

export default BadgePill;
