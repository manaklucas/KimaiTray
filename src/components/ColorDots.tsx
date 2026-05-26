import type { ColorMode } from "../types";
import { resolveDisplayColors } from "../utils/colorMode";

interface ColorDotsProps {
  activityColor: string;
  projectColor: string;
  customerColor: string;
  colorMode: ColorMode;
  size?: "sm" | "md";
  pulse?: boolean;
}

export default function ColorDots({
  activityColor,
  projectColor,
  customerColor,
  colorMode,
  size = "md",
  pulse,
}: ColorDotsProps) {
  const colors = resolveDisplayColors(
    activityColor,
    projectColor,
    customerColor,
    colorMode,
  );
  const sizeClass = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const pulseClass = pulse ? "animate-pulse" : "";

  if (colors.length === 1) {
    return (
      <span
        className={`inline-block ${sizeClass} shrink-0 rounded-full ${pulseClass}`}
        style={{ backgroundColor: colors[0] }}
      />
    );
  }

  return (
    <span className="inline-flex gap-0.5 shrink-0">
      {colors.map((c, i) => (
        <span
          key={i}
          className={`inline-block ${sizeClass} rounded-full ${pulseClass}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}
