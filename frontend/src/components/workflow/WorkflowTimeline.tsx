import React from "react";
import type { WorkflowStep, WorkflowLog } from "../../services/workflowService";

type Props = {
    steps: WorkflowStep[];
    logs: WorkflowLog[];
};

const WorkflowTimeline: React.FC<Props> = ({ steps, logs }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Workflow Timeline</h2>

            {steps.map((step) => {
                const stepLogs = logs.filter((log) => log.stepId === step.stepId);

                const badgeClass =
                    step.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : step.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : step.status === "running"
                                ? "bg-yellow-100 text-yellow-800"
                                : step.status === "paused"
                                    ? "bg-blue-100 text-blue-800"
                                    : step.status === "cancelled"
                                        ? "bg-gray-200 text-gray-800"
                                        : "bg-gray-100 text-gray-800";

                return (
                    <div key={step.id} className="p-4 bg-white border rounded">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{step.stepId}</h3>
                            <span
                                className={`px-2 py-1 rounded text-sm font-medium ${badgeClass}`}
                            >
                                {step.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Started: {new Date(step.createdAt).toLocaleString()}
                        </p>

                        {stepLogs.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {stepLogs.map((log) => (
                                    <li key={log.id} className="text-sm text-gray-700">
                                        <span className="font-mono">{log.status}</span> –{" "}
                                        {log.message ?? ""}
                                        <span className="ml-2 text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default WorkflowTimeline;