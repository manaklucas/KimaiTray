import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { KimaiClient } from "../api/kimaiClient";
import { getCustomers, getProjects } from "../api/projectApi";
import { getActivities } from "../api/activityApi";
import type { StartTaskPayload } from "../hooks/useStartTask";

interface NewTaskFormProps {
  client: KimaiClient;
  hasActiveTimer: boolean;
  onSubmit: (payload: StartTaskPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const selectCls =
  "w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none disabled:opacity-50";

export default function NewTaskForm({
  client,
  hasActiveTimer,
  onSubmit,
  onCancel,
  isSubmitting,
}: NewTaskFormProps) {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [activityId, setActivityId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [beginTime, setBeginTime] = useState("");

  const customersQ = useQuery({
    queryKey: ["customers", client.baseUrl],
    queryFn: () => getCustomers(client),
    staleTime: 5 * 60 * 1000,
  });

  const projectsQ = useQuery({
    queryKey: ["projects", client.baseUrl],
    queryFn: () => getProjects(client),
    staleTime: 5 * 60 * 1000,
  });

  const activitiesQ = useQuery({
    queryKey: ["activities", client.baseUrl],
    queryFn: () => getActivities(client),
    staleTime: 5 * 60 * 1000,
  });

  const customers = customersQ.data ?? [];

  const filteredProjects = useMemo(
    () =>
      (projectsQ.data ?? []).filter(
        (p) => customerId == null || p.customer === customerId,
      ),
    [projectsQ.data, customerId],
  );

  const filteredActivities = useMemo(
    () =>
      (activitiesQ.data ?? []).filter(
        (a) =>
          projectId == null || a.project === null || a.project === projectId,
      ),
    [activitiesQ.data, projectId],
  );

  const handleCustomerChange = (id: number | null) => {
    setCustomerId(id);
    setProjectId(null);
    setActivityId(null);
  };

  const handleProjectChange = (id: number | null) => {
    setProjectId(id);
    setActivityId(null);
  };

  const selectedProject = filteredProjects.find((p) => p.id === projectId);
  const canSubmit = projectId != null && activityId != null && !isSubmitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      projectId: projectId!,
      activityId: activityId!,
      description: description.trim() || undefined,
      begin:
        useCustomTime && beginTime
          ? new Date(beginTime).toISOString()
          : undefined,
      label: selectedProject?.name ?? `Project #${projectId}`,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          New Task
        </span>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-0.5 -mr-0.5"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            Customer
          </label>
          <select
            value={customerId ?? ""}
            onChange={(e) =>
              handleCustomerChange(
                e.target.value ? Number(e.target.value) : null,
              )
            }
            disabled={isSubmitting}
            className={selectCls}
          >
            <option value="">All customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            Project <span className="text-red-400">*</span>
          </label>
          <select
            value={projectId ?? ""}
            onChange={(e) =>
              handleProjectChange(
                e.target.value ? Number(e.target.value) : null,
              )
            }
            disabled={isSubmitting}
            className={selectCls}
          >
            <option value="">Select project…</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            Activity <span className="text-red-400">*</span>
          </label>
          <select
            value={activityId ?? ""}
            onChange={(e) =>
              setActivityId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isSubmitting || projectId == null}
            className={selectCls}
          >
            <option value="">
              {projectId == null ? "Select project first" : "Select activity…"}
            </option>
            {filteredActivities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            placeholder="Optional note…"
            className={selectCls}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              Start time
            </label>
            <button
              type="button"
              onClick={() => setUseCustomTime(!useCustomTime)}
              className="text-[9px] text-blue-500 dark:text-blue-400 hover:underline"
            >
              {useCustomTime ? "Use now" : "Custom"}
            </button>
          </div>
          {useCustomTime ? (
            <input
              type="datetime-local"
              value={beginTime}
              onChange={(e) => setBeginTime(e.target.value)}
              disabled={isSubmitting}
              className={selectCls}
            />
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Now
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium
            text-gray-600 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium
            bg-emerald-500 text-white
            hover:bg-emerald-600 active:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
        >
          {isSubmitting ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : hasActiveTimer ? (
            <>
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
              Stop & Start
            </>
          ) : (
            <>
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start
            </>
          )}
        </button>
      </div>
    </div>
  );
}
