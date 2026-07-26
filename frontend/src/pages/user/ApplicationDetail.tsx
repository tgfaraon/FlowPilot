import { useEffect, useState } from "react";
import WorkflowTimeline from "../../components/workflow/WorkflowTimeline";
import { fetchWorkflowDetail, resumeWorkflow } from "../../services/workflowService";
import { useParams } from "react-router-dom";
import type { WorkflowStep, WorkflowLog } from "../../services/workflowService";
import { cancelWorkflow } from "../../services/workflowService";

function ApplicationDetail() {
    const { id } = useParams();
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [logs, setLogs] = useState<WorkflowLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        fetchWorkflowDetail(id)
            .then(data => {
                setSteps(data.steps);
                setLogs(data.logs);
            })
            .catch(() => setError("Unable to load application details. Please try again later."))
            .finally(() => setLoading(false));
    }, [id]);

    const completedCount = steps.filter(s => s.status === "completed").length;
    const totalCount = steps.length;
    const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    async function handleResume() {
        if (!id) return;
        try {
            await resumeWorkflow(id);
            setActionMessage("Workflow resumed successfully.");
        } catch {
            setActionMessage("Failed to resume workflow.");
        }
    }

    async function handlePause() {
        setActionMessage("Pause functionality not yet implemented.");
    }

    async function handleCancel() {
        if (!id) return;
        try {
            await cancelWorkflow(id);
            setActionMessage("Workflow cancelled successfully.");
        } catch {
            setActionMessage("Failed to cancel workflow.");
        }
    }

    return (
        <div className="p-6">
            <h1 className="mb-6 text-3xl font-bold">Application Status</h1>

            {loading && (
                <div className="flex items-center justify-center p-6">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading...</span>
                </div>
            )}

            {error && (
                <div className="p-6 mb-6 text-red-700 bg-red-100 rounded">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Progress bar */}
                    <div className="w-full h-4 mb-6 bg-gray-200 rounded-full">
                        <div
                            className="h-4 transition-all bg-blue-600 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="mb-6 text-sm text-gray-500">
                        {completedCount} of {totalCount} steps completed ({progressPercent}%)
                    </p>

                    {/* Controls */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={handleResume}
                            className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            Resume Workflow
                        </button>
                        <button
                            onClick={handlePause}
                            className="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                        >
                            Pause Workflow
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                        >
                            Cancel Workflow
                        </button>
                    </div>
                    {actionMessage && (
                        <p className="mb-6 text-sm text-gray-600">{actionMessage}</p>
                    )}

                    {/* Timeline */}
                    <div className="p-6 bg-white rounded shadow">
                        <WorkflowTimeline steps={steps} logs={logs} />
                    </div>
                </>
            )}
        </div>
    );
}

export default ApplicationDetail;