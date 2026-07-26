import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllWorkflows } from "../../services/workflowService";
import type { WorkflowSummary } from "../../services/workflowService";
import WorkflowStatusChart from "../../components/WorkflowStatusChart";
import LoadingError from "../../components/common/LoadingError";

function PlatformDashboardMetrics({ workflows }: { workflows: WorkflowSummary[] }) {
    const total = workflows.length;
    const running = workflows.filter(wf => wf.status === "running").length;
    const completed = workflows.filter(wf => wf.status === "completed").length;
    const failed = workflows.filter(wf => wf.status === "failed").length;

    return (
        <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="text-xl font-semibold">{total}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Running</h3>
                <p className="text-xl font-semibold">{running}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-xl font-semibold">{completed}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Failed</h3>
                <p className="text-xl font-semibold">{failed}</p>
            </div>
        </div>
    );
}

export default function PlatformAdminDashboard() {
    const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAllWorkflows();
                setWorkflows(data);
            } catch {
                setError("Failed to load workflow instances");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingError loading={true}>Loading workflows...</LoadingError>;
    if (error) return <LoadingError loading={false}>{error}</LoadingError>;

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Platform Admin Dashboard</h1>

            {/* Metrics + chart */}
            <PlatformDashboardMetrics workflows={workflows} />
            <div className="mt-6">
                <WorkflowStatusChart workflows={workflows} />
            </div>

            {/* Workflow list */}
            <div className="p-4 mt-8 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold">All Workflow Instances</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Name</th>
                            <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">User</th>
                            <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Status</th>
                            <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Created</th>
                            <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {workflows.map((wf) => (
                            <tr key={wf.id}>
                                <td className="px-4 py-2">{wf.workflowName}</td>
                                <td className="px-4 py-2">{wf.userEmail}</td>
                                <td className="px-4 py-2">{wf.status}</td>
                                <td className="px-4 py-2">
                                    {new Date(wf.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => navigate(`/platform/workflows/${wf.id}`)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Monitor
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}