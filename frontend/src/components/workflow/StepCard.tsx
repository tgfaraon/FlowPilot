import React from "react";
import type { WorkflowStep } from "../../services/workflowService";

export interface StepCardProps {
    step: WorkflowStep;
}

export const StepCard: React.FC<StepCardProps> = ({ step }) => {
    const statusColors: Record<WorkflowStep["status"], string> = {
        pending: "bg-gray-200 text-gray-800",
        running: "bg-blue-200 text-blue-800",
        paused: "bg-yellow-200 text-yellow-800",
        completed: "bg-green-200 text-green-800",
        failed: "bg-red-200 text-red-800",
        cancelled: "bg-gray-400 text-gray-800",
    };

    return (
        <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{step.name}</h3>
                <span
                    className={`px-2 py-1 rounded text-sm ${statusColors[step.status] || "bg-gray-200 text-gray-800"
                        }`}
                >
                    {step.status}
                </span>
            </div>
            <p className="text-sm text-gray-500">Step ID: {step.stepId}</p>
            {step.logs && step.logs.length > 0 && (
                <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Logs:</h4>
                    <ul className="text-xs text-gray-600 list-disc list-inside">
                        {step.logs.map((log: string, idx: number) => (
                            <li key={idx}>{log}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};