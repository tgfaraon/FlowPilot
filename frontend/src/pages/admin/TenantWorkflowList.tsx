import { useEffect, useState } from "react";

type WorkflowInstance = {
    id: string;
    status: string;
    createdAt: string;
    workflowName?: string;
};

export default function TenantWorkflowList() {
    const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/workflows`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => res.json())
            .then(setWorkflows)
            .catch(console.error);
    }, []);

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Tenant Workflows</h1>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {workflows.map(wf => (
                        <tr key={wf.id}>
                            <td>{wf.id}</td>
                            <td>{wf.status}</td>
                            <td>{new Date(wf.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}