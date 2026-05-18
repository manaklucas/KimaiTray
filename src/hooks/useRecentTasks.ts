import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { KimaiClient } from "../api/kimaiClient";
import { getRecentTimesheets } from "../api/timesheetApi";
import { getProjects, getCustomers } from "../api/projectApi";
import { getActivities } from "../api/activityApi";
import type { RecentTask } from "../types";
import { extractId } from "../api/kimaiTypes";

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function useRecentTasks(
  client: KimaiClient | null,
  isConfigured: boolean,
) {
  const enabled = !!client && isConfigured;

  const recentQ = useQuery({
    queryKey: ["recent-timesheets", client?.baseUrl],
    queryFn: () => getRecentTimesheets(client!, 20),
    enabled,
    staleTime: 30_000,
  });

  const projectsQ = useQuery({
    queryKey: ["projects", client?.baseUrl],
    queryFn: () => getProjects(client!),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const activitiesQ = useQuery({
    queryKey: ["activities", client?.baseUrl],
    queryFn: () => getActivities(client!),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const customersQ = useQuery({
    queryKey: ["customers", client?.baseUrl],
    queryFn: () => getCustomers(client!),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const tasks = useMemo<RecentTask[]>(() => {
    const entries = recentQ.data ?? [];
    const projects = projectsQ.data ?? [];
    const activities = activitiesQ.data ?? [];
    const customers = customersQ.data ?? [];

    const seen = new Set<string>();
    const result: RecentTask[] = [];

    for (const entry of entries) {
      const projectId = extractId(entry.project);
      const activityId = extractId(entry.activity);
      const key = `${projectId}-${activityId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const proj = projects.find((p) => p.id === projectId);
      const act = activities.find((a) => a.id === activityId);
      const cust = proj
        ? customers.find((c) => c.id === proj.customer)
        : undefined;

      result.push({
        key,
        projectId,
        activityId,
        project: proj?.name ?? `Project #${projectId}`,
        projectColor: proj?.color ?? "#6b7280",
        customer: cust?.name ?? "",
        activity: act?.name ?? `Activity #${activityId}`,
        description: entry.description ?? "",
        lastUsed: formatRelativeDate(entry.begin),
      });

      if (result.length >= 6) break;
    }

    return result;
  }, [recentQ.data, projectsQ.data, activitiesQ.data, customersQ.data]);

  return {
    tasks,
    isLoading: recentQ.isLoading,
    isError: recentQ.isError,
  };
}
