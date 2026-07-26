import React from "react";
import type { WorkflowStep, WorkflowLog } from "../../services/workflowService";

interface WorkflowMetricsProps {
    steps: WorkflowStep[];
    logs?: WorkflowLog[];
}

const WorkflowMetrics: React.FC<WorkflowMetricsProps> = ({ steps, logs = [] }) => {
    const source = steps.length > 0 ? steps : logs;
    if (source.length === 0) return null;

    const start = new Date(source[0].createdAt).getTime();
    const end = new Date(source[source.length - 1].createdAt).getTime();
    const totalDuration = (end - start) / 1000; // seconds

    return (
        <section className="p-4 bg-white rounded-lg shadow-sm">
            <h2 className="mb-3 text-xl font-semibold">Workflow Metrics</h2>
            <p className="text-sm text-gray-600">
                Total Duration: {totalDuration.toFixed(1)} seconds
            </p>
        </section>
    );
};

export default WorkflowMetrics;