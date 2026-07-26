import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkflows } from "../../services/workflowService";
import type { WorkflowSummary } from "../../services/workflowService";

export default function WorkflowList() {
    const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // For platform admins, backend should return all workflows across tenants
                const data = await fetchWorkflows();
                setWorkflows(data);
            } catch {
                setError("Failed to load workflows");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-6">Loading workflows...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Platform Workflows</h1>
            <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg shadow">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">ID</th>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Tenant</th>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Name</th>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Status</th>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Created</th>
                        <th className="px-4 py-2 text-sm font-medium text-left text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {workflows.map((wf) => (
                        <tr key={wf.id}>
                            <td className="px-4 py-2">{wf.id}</td>
                            <td className="px-4 py-2">{wf.tenantId}</td>
                            <td className="px-4 py-2">{wf.workflowName}</td>
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
    );
}