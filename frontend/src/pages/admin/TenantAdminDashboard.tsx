import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTenantWorkflows, resumeWorkflow, cancelWorkflow } from "../../services/workflowService";
import type { WorkflowSummary } from "../../services/workflowService";
import LoadingError from "../../components/common/LoadingError";
import { Bar } from "react-chartjs-2";

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        running: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        paused: "bg-blue-100 text-blue-800",
        cancelled: "bg-gray-100 text-gray-800",
    };
    return (
        <span className={`px-2 py-1 rounded text-sm font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
            {status}
        </span>
    );
}

function TenantDashboardMetrics({ workflows }: { workflows: WorkflowSummary[] }) {
    const total = workflows.length;
    const running = workflows.filter(wf => wf.status === "running").length;
    const completed = workflows.filter(wf => wf.status === "completed").length;
    const failed = workflows.filter(wf => wf.status === "failed").length;
    const paused = workflows.filter(wf => wf.status === "paused").length;
    const cancelled = workflows.filter(wf => wf.status === "cancelled").length;

    return (
        <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg shadow"><h3>Total</h3><p>{total}</p></div>
            <div className="p-4 bg-white rounded-lg shadow"><h3>Running</h3><p>{running}</p></div>
            <div className="p-4 bg-white rounded-lg shadow"><h3>Completed</h3><p>{completed}</p></div>
            <div className="p-4 bg-white rounded-lg shadow"><h3>Failed</h3><p>{failed}</p></div>
            <div className="p-4 bg-white rounded-lg shadow"><h3>Paused/Cancelled</h3><p>{paused + cancelled}</p></div>
        </div>
    );
}

function WorkflowStatusChart({ workflows }: { workflows: WorkflowSummary[] }) {
    const counts: Record<string, number> = {
        running: workflows.filter(wf => wf.status === "running").length,
        completed: workflows.filter(wf => wf.status === "completed").length,
        failed: workflows.filter(wf => wf.status === "failed").length,
        paused: workflows.filter(wf => wf.status === "paused").length,
        cancelled: workflows.filter(wf => wf.status === "cancelled").length,
    };

    const data = {
        labels: Object.keys(counts),
        datasets: [
            {
                label: "Workflow Status Distribution",
                data: Object.values(counts),
                backgroundColor: [
                    "#facc15", // running - yellow
                    "#22c55e", // completed - green
                    "#ef4444", // failed - red
                    "#3b82f6", // paused - blue
                    "#6b7280", // cancelled - gray
                ],
            },
        ],
    };

    return <Bar data={data} />;
}

export default function TenantAdminDashboard() {
    const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchTenantWorkflows();
                setWorkflows(data);
            } catch {
                setError("Failed to load tenant workflows");
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
            <h1 className="mb-6 text-2xl font-bold">Tenant Admin Dashboard</h1>
            <TenantDashboardMetrics workflows={workflows} />
            <div className="mt-6"><WorkflowStatusChart workflows={workflows} /></div>

            <div className="p-4 mt-8 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold">Tenant Workflow Instances</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th>Name</th><th>User</th><th>Status</th><th>Created</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {workflows.map((wf) => (
                            <tr key={wf.id}>
                                <td>{wf.workflowName}</td>
                                <td>{wf.userEmail}</td>
                                <td><StatusBadge status={wf.status} /></td>
                                <td>{new Date(wf.createdAt).toLocaleString()}</td>
                                <td className="space-x-2">
                                    <button onClick={() => navigate(`/tenant/workflows/${wf.id}`)} className="text-blue-600 hover:text-blue-800">Monitor</button>
                                    <button onClick={() => resumeWorkflow(wf.id)} className="text-green-600 hover:text-green-800">Resume</button>
                                    <button onClick={() => cancelWorkflow(wf.id)} className="text-red-600 hover:text-red-800">Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}