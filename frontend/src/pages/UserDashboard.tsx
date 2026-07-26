import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchWorkflows } from "../services/workflowService";
import type { WorkflowSummary } from "../services/workflowService";

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "completed":
            return "bg-green-100 text-green-700";
        case "running":
            return "bg-yellow-100 text-yellow-700";
        case "failed":
        case "error":
            return "bg-red-100 text-red-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
}

export default function UserDashboard() {
    const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchWorkflows();
                setWorkflows(data);
            } catch {
                setError("Failed to load workflows");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filteredWorkflows = useMemo(() => {
        return workflows.filter((w) => {
            const name = w.workflowName ?? "";
            const id = w.id ?? "";
            const email = w.userEmail ?? "";
            const status = w.status ?? "";

            const matchesSearch =
                name.toLowerCase().includes(search.toLowerCase()) ||
                id.toLowerCase().includes(search.toLowerCase()) ||
                email.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [workflows, search, statusFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading workflows…</span>
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Workflows</h1>
                    <p className="text-sm text-gray-500">
                        Track the progress of your submitted workflows
                    </p>
                </div>
            </header>

            {/* Summary Bar */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold">{workflows.length}</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Running</p>
                    <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status.toLowerCase() === "running").length}
                    </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status.toLowerCase() === "completed").length}
                    </p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                        {workflows.filter(w => w.status.toLowerCase() === "failed").length}
                    </p>
                </div>
            </div>

            {/* Search + Filter Controls */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
                <input
                    type="text"
                    placeholder="Search workflows…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="all">All Statuses</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Workflow List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWorkflows.map((workflow) => (
                    <Link
                        key={workflow.id}
                        to={`/workflows/${workflow.id}`}
                        className="block border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="text-lg font-semibold">{workflow.workflowName}</h2>
                                <p className="text-xs text-gray-400">ID: {workflow.id}</p>
                                {workflow.userEmail && (
                                    <p className="text-xs text-gray-400">User: {workflow.userEmail}</p>
                                )}
                            </div>
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                    workflow.status
                                )}`}
                            >
                                {workflow.status}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs text-gray-500">
                            <p>
                                <span className="font-medium">Created:</span>{" "}
                                {new Date(workflow.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}