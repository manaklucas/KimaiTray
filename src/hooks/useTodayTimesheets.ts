import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { KimaiClient } from "../api/kimaiClient";
import { getTimesheets } from "../api/timesheetApi";
import { getProjects, getCustomers } from "../api/projectApi";
import { getActivities } from "../api/activityApi";
import type { TodayEntry } from "../types";
import { extractId } from "../api/kimaiTypes";
import { normalizeKimaiTags } from "../api/tagUtils";
import { getLocalDayRange } from "../utils/time";

const DEFAULT_VISIBLE = 5;

export function useTodayTimesheets(
  client: KimaiClient | null,
  isConfigured: boolean,
  refreshIntervalSec: number,
) {
  const enabled = !!client && isConfigured;
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const timesheetsQ = useQuery({
    queryKey: ["today-timesheets", client?.baseUrl],
    queryFn: () => {
      const { begin, end } = getLocalDayRange();
      return getTimesheets(client!, {
        begin,
        end,
        orderBy: "begin",
        order: "DESC",
        size: 50,
      });
    },
    enabled,
    refetchInterval: refreshIntervalSec * 1000,
    staleTime: 15_000,
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

  const { entries, totalDuration } = useMemo(() => {
    const raw = timesheetsQ.data ?? [];
    const projects = projectsQ.data ?? [];
    const activities = activitiesQ.data ?? [];
    const customers = customersQ.data ?? [];

    const mapped: TodayEntry[] = raw.map((entry) => {
      const projectId = extractId(entry.project);
      const activityId = extractId(entry.activity);
      const proj = projects.find((p) => p.id === projectId);
      const act = activities.find((a) => a.id === activityId);
      const cust = proj
        ? customers.find((c) => c.id === proj.customer)
        : undefined;

      const isRunning = entry.end === null;
      let duration = entry.duration;
      if (isRunning) {
        duration = Math.floor(
          (Date.now() - new Date(entry.begin).getTime()) / 1000,
        );
      }

      return {
        id: entry.id,
        projectId,
        activityId,
        project: proj?.name ?? `Project #${projectId}`,
        projectColor: proj?.color ?? "#6b7280",
        customer: cust?.name ?? "",
        activity: act?.name ?? `Activity #${activityId}`,
        description: entry.description ?? "",
        tags: normalizeKimaiTags(entry.tags),
        billable: entry.billable,
        beginIso: entry.begin,
        endIso: entry.end,
        duration,
        isRunning,
      };
    });

    const sorted = [...mapped].sort((a, b) => {
      const diff =
        new Date(a.beginIso).getTime() - new Date(b.beginIso).getTime();
      return sortAsc ? diff : -diff;
    });

    let total = 0;
    for (const e of mapped) {
      total += e.duration ?? 0;
    }

    return { entries: sorted, totalDuration: total };
  }, [
    timesheetsQ.data,
    projectsQ.data,
    activitiesQ.data,
    customersQ.data,
    sortAsc,
  ]);

  const visibleEntries = expanded
    ? entries
    : entries.slice(0, DEFAULT_VISIBLE);
  const hasMore = entries.length > DEFAULT_VISIBLE;

  return {
    entries: visibleEntries,
    totalCount: entries.length,
    totalDuration,
    hasMore,
    expanded,
    setExpanded,
    sortAsc,
    setSortAsc,
    isLoading: timesheetsQ.isLoading,
    isError: timesheetsQ.isError,
    refetch: timesheetsQ.refetch,
  };
}
