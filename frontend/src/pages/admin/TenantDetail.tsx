// src/pages/admin/TenantDetail.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getTenantById,
    assignTenantAdmin,
    createInvite,
} from "../../services/userService";

interface Tenant {
    id: string;
    name: string;
    createdAt: string;
    admins?: { id: string; email: string }[];
}

export default function TenantDetail() {
    const { id } = useParams<{ id: string }>();

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);

    // Admin assignment
    const [adminEmail, setAdminEmail] = useState("");

    // Invite creation
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("endUser");

    // Load tenant details
    useEffect(() => {
        const loadTenant = async () => {
            try {
                if (!id) return;
                const data = await getTenantById(id);
                setTenant(data);
            } catch (err) {
                console.error("Failed to fetch tenant", err);
            } finally {
                setLoading(false);
            }
        };

        loadTenant();
    }, [id]);

    // Assign admin handler
    const handleAssignAdmin = async () => {
        if (!id || !adminEmail.trim()) return;

        try {
            await assignTenantAdmin(id, adminEmail);
            const updated = await getTenantById(id);
            setTenant(updated);
            setAdminEmail("");
        } catch (err) {
            console.error("Failed to assign admin", err);
        }
    };

    // Invite handler
    const handleInvite = async () => {
        if (!id || !inviteEmail.trim()) return;

        try {
            await createInvite(id, inviteEmail, inviteRole);
            setInviteEmail("");
            setInviteRole("endUser");
        } catch (err) {
            console.error("Failed to create invite", err);
        }
    };

    if (loading) return <p>Loading tenant...</p>;
    if (!tenant) return <p>Tenant not found.</p>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="mb-2 text-2xl font-bold">Tenant: {tenant.name}</h1>
                <p className="text-gray-600">
                    Created: {new Date(tenant.createdAt).toLocaleString()}
                </p>
            </div>

            {/* Admins Section */}
            <div>
                <h2 className="mb-2 text-xl font-semibold">Admins</h2>

                {tenant.admins && tenant.admins.length > 0 ? (
                    <ul className="pl-6 list-disc">
                        {tenant.admins.map((a) => (
                            <li key={a.id}>{a.email}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No admins assigned yet.</p>
                )}
            </div>

            {/* Assign Admin */}
            <div className="space-y-2">
                <h3 className="font-semibold">Assign Admin</h3>

                <div className="flex items-center space-x-2">
                    <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Admin email"
                        className="px-2 py-1 border rounded"
                    />

                    <button
                        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                        onClick={handleAssignAdmin}
                    >
                        Assign
                    </button>
                </div>
            </div>

            {/* Invite User */}
            <div className="space-y-2">
                <h3 className="font-semibold">Send Invite</h3>

                <div className="flex items-center space-x-2">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Invite email"
                        className="px-2 py-1 border rounded"
                    />

                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="px-2 py-1 border rounded"
                    >
                        <option value="endUser">End User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                        onClick={handleInvite}
                    >
                        Send Invite
                    </button>
                </div>
            </div>
        </div>
    );
}