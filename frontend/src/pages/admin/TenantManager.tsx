import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import { getTenants, createTenant } from "../../services/userService";

interface Tenant {
    id: string;
    name: string;
    createdAt: string;
}

export default function TenantManager() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTenantName, setNewTenantName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const data = await getTenants();
                setTenants(data);
            } catch (err) {
                console.error("Failed to fetch tenants", err);
            } finally {
                setLoading(false);
            }
        };

        loadTenants();
    }, []);

    const handleCreateTenant = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTenantName.trim()) return;

        try {
            await createTenant(newTenantName);
            setNewTenantName("");
            // ✅ Refresh list after creating
            const data = await getTenants();
            setTenants(data);
        } catch (err) {
            console.error("Failed to create tenant", err);
        }
    };

    if (loading) return <p>Loading tenants...</p>;

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Tenant Manager</h1>

            {/* Create Tenant Form */}
            <form onSubmit={handleCreateTenant} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    placeholder="Enter tenant name"
                    className="w-64 px-3 py-2 border rounded"
                />
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Create Tenant
                </button>
            </form>

            {/* Tenant Table */}
            <table className="w-full border border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-2 py-1 text-left border">Name</th>
                        <th className="px-2 py-1 text-left border">Created</th>
                        <th className="px-2 py-1 text-left border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tenants.map((t) => (
                        <tr key={t.id}>
                            <td className="px-2 py-1 border">{t.name}</td>
                            <td className="px-2 py-1 border">
                                {new Date(t.createdAt).toLocaleString()}
                            </td>
                            <td className="px-2 py-1 border">
                                <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => navigate(`/platform/tenants/${t.id}`)}
                                >
                                    Manage
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}