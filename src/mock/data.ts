import type { ActiveTimer, RecentTask } from "../types";

export const mockActiveTimer: ActiveTimer = {
  id: 1,
  project: "Website Redesign",
  projectColor: "#10b981",
  activity: "Development",
  description: "Implementing dashboard layout",
  beginSeconds: Math.floor(Date.now() / 1000) - 2 * 3600 - 15 * 60,
};

export const mockRecentTasks: RecentTask[] = [
  {
    id: 10,
    project: "Website Redesign",
    projectColor: "#10b981",
    activity: "Development",
    description: "API integration",
    lastUsed: "Today",
  },
  {
    id: 11,
    project: "Mobile App",
    projectColor: "#3b82f6",
    activity: "Design",
    description: "User flow wireframes",
    lastUsed: "Today",
  },
  {
    id: 12,
    project: "Client Portal",
    projectColor: "#f59e0b",
    activity: "Meeting",
    description: "Sprint planning",
    lastUsed: "Yesterday",
  },
  {
    id: 13,
    project: "Website Redesign",
    projectColor: "#10b981",
    activity: "Testing",
    description: "Cross-browser testing",
    lastUsed: "Yesterday",
  },
  {
    id: 14,
    project: "Internal Tools",
    projectColor: "#8b5cf6",
    activity: "Development",
    description: "CI/CD pipeline setup",
    lastUsed: "May 16",
  },
  {
    id: 15,
    project: "Mobile App",
    projectColor: "#3b82f6",
    activity: "Development",
    description: "Push notifications",
    lastUsed: "May 15",
  },
];

export const mockTodayTotal = "5h 42m";
