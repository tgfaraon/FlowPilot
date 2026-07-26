import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchWorkflowDetail } from "../services/workflowService";
import WorkflowTimeline from "../components/workflow/WorkflowTimeline";
import { StepCard } from "../components/workflow/StepCard";
import WorkflowMetrics from "../components/workflow/WorkflowMetrics";

import type {
    WorkflowStep,
    WorkflowLog,
} from "../services/workflowService";

export interface WorkflowDetailData {
    steps: WorkflowStep[];
    logs: WorkflowLog[];
}

function getStatusColor(status: string) {
    switch (status?.toLowerCase()) {
        case "completed":
            return "bg-green-500";
        case "running":
            return "bg-yellow-500";
        case "failed":
        case "error":
            return "bg-red-500";
        case "paused":
            return "bg-blue-500";
        case "cancelled":
            return "bg-gray-500";
        default:
            return "bg-gray-400";
    }
}

export default function WorkflowDetail() {
    const { id } = useParams<{ id: string }>();
    const [detail, setDetail] = useState<WorkflowDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const raw = await fetchWorkflowDetail(id!);

                const data: WorkflowDetailData = {
                    steps: raw.steps.map((s): WorkflowStep => ({
                        ...s,
                        stepId: s.stepId ?? "",
                        name: s.name ?? "(unnamed step)",
                        createdAt: s.createdAt ?? new Date().toISOString(),
                        logs: s.logs ?? [],
                    })),
                    logs: raw.logs.map((l): WorkflowLog => ({
                        ...l,
                        stepId: l.stepId ?? "",
                        status: l.status ?? "unknown",
                        message: l.message ?? null,
                        createdAt: l.createdAt ?? new Date().toISOString(),
                    })),
                };

                setDetail(data);
            } catch {
                setError("Failed to load workflow details");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading workflow…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-700 bg-red-100 rounded">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    if (!detail) return null;

    const sortedLogs = [...detail.logs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Workflow Detail</h1>
                    <p className="text-sm text-gray-500">ID: {id}</p>
                </div>
            </header>

            <WorkflowTimeline steps={detail.steps} logs={detail.logs} />
            <WorkflowMetrics steps={detail.steps} logs={detail.logs} />

            <section className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="mb-3 text-xl font-semibold">Steps</h2>
                {detail.steps.length === 0 ? (
                    <p className="text-sm text-gray-500">No steps recorded yet.</p>
                ) : (
                    <div className="grid gap-4">
                        {detail.steps.map((step) => (
                            <StepCard key={step.id} step={step} />
                        ))}
                    </div>
                )}
            </section>

            <section className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold">Execution Timeline</h2>
                {sortedLogs.length === 0 ? (
                    <p className="text-sm text-gray-500">No logs recorded for this workflow.</p>
                ) : (
                    <div className="relative">
                        <div className="absolute top-0 bottom-0 w-px bg-gray-200 left-4" />
                        <ul className="space-y-4">
                            {sortedLogs.map((log) => (
                                <li key={log.id} className="relative pl-10">
                                    <span
                                        className={`absolute left-2 top-2 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                            log.status
                                        )}`}
                                    />
                                    <div className="p-3 border rounded-md bg-gray-50">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold">
                                                {log.stepId}{" "}
                                                <span className="text-xs text-gray-500">({log.status})</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        {log.message && (
                                            <p className="text-sm text-gray-700">{log.message}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}