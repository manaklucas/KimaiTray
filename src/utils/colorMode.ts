import type { ColorMode } from "../types";

const FALLBACK = "#6b7280";

export function resolveDisplayColors(
  activityColor: string,
  projectColor: string,
  customerColor: string,
  mode: ColorMode,
): string[] {
  switch (mode) {
    case "activity":
      return [activityColor || FALLBACK];
    case "project":
      return [projectColor || FALLBACK];
    case "customer":
      return [customerColor || FALLBACK];
    case "activity-project":
      return [activityColor || FALLBACK, projectColor || FALLBACK];
    case "activity-customer":
      return [activityColor || FALLBACK, customerColor || FALLBACK];
    case "project-customer":
      return [projectColor || FALLBACK, customerColor || FALLBACK];
    case "kimai":
    default:
      return [activityColor || projectColor || customerColor || FALLBACK];
  }
}
