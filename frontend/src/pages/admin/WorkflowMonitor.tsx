import { useEffect, useState } from "react";
import WorkflowTimeline from "../../components/workflow/WorkflowTimeline";
import WorkflowMetrics from "../../components/workflow/WorkflowMetrics";
import { fetchWorkflowDetail, resumeWorkflow } from "../../services/workflowService";
import { useParams } from "react-router-dom";
import type { WorkflowStep, WorkflowLog } from "../../services/workflowService";

export default function WorkflowMonitor() {
    const { id } = useParams<{ id: string }>();
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [logs, setLogs] = useState<WorkflowLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetchWorkflowDetail(id)
            .then((data) => {
                setSteps(data.steps);
                setLogs(data.logs);
            })
            .catch(() =>
                setError("Unable to load workflow details. Please try again later.")
            )
            .finally(() => setLoading(false));
    }, [id]);

    async function handleApprove() {
        if (!id) return;
        setApproving(true);
        try {
            await resumeWorkflow(id);
            window.location.reload();
        } catch {
            setError("Failed to approve workflow step");
        } finally {
            setApproving(false);
        }
    }

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Workflow Monitor</h1>
                    <p className="text-sm text-gray-500">Instance ID: {id}</p>
                </div>
            </header>

            {loading && (
                <div className="flex items-center justify-center p-6">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading workflow…</span>
                </div>
            )}

            {error && (
                <div className="p-6 text-red-700 bg-red-100 rounded">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Timeline visualization */}
                    <section className="p-6 bg-white rounded-lg shadow-sm">
                        <WorkflowTimeline steps={steps} logs={logs} />
                    </section>

                    {/* Metrics summary */}
                    <section className="p-6 bg-white rounded-lg shadow-sm">
                        <WorkflowMetrics steps={steps} />
                    </section>

                    {/* Logs timeline */}
                    <section className="p-6 bg-white rounded-lg shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Execution Logs</h2>
                        {logs.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No logs recorded for this workflow.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {logs.map((log) => {
                                    const badgeClass =
                                        log.status === "running"
                                            ? "bg-yellow-500 text-white"
                                            : log.status === "completed"
                                                ? "bg-green-600 text-white"
                                                : log.status === "failed"
                                                    ? "bg-red-600 text-white"
                                                    : "bg-gray-400 text-white";

                                    return (
                                        <li key={log.id} className="p-3 border rounded bg-gray-50">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="flex items-center gap-2 font-semibold">
                                                    Step {log.stepId}
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${badgeClass}`}
                                                    >
                                                        {log.status.toUpperCase()}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {log.message && (
                                                <p className="text-sm text-gray-600">{log.message}</p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* 🔥 Approve button when workflow is paused */}
                        {logs.some((log) => log.status === "waiting_manual") && (
                            <div className="mt-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={approving}
                                    className={`px-4 py-2 text-white rounded ${approving
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {approving ? "Approving…" : "Approve Step"}
                                </button>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}