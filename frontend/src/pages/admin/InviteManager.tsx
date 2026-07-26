import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface Invite {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    expiresAt: string;
}

export default function InviteManager() {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [form, setForm] = useState({ tenantId: "", email: "", role: "user" });

    const fetchInvites = useCallback(async (tenantId: string) => {
        const res = await axios.get(`/invites/${tenantId}`);
        setInvites(res.data);
    }, []);

    const createInvite = async () => {
        await axios.post("/invites", form);
        fetchInvites(form.tenantId);
    };

    const deleteInvite = async (id: string) => {
        await axios.delete(`/invites/${id}`);
        fetchInvites(form.tenantId);
    };

    useEffect(() => {
        if (!form.tenantId.trim()) return;

        const loadInvites = async () => {
            const res = await axios.get(`/invites/${form.tenantId}`);
            setInvites(res.data);
        };

        loadInvites();
    }, [form.tenantId]);

    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Invite Manager</h1>

            <div className="mb-6 space-y-2">
                <input
                    placeholder="Tenant ID"
                    value={form.tenantId}
                    onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                    className="p-2 border"
                />
                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="p-2 border"
                />
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="p-2 border"
                >
                    <option value="user">End User</option>
                    <option value="admin">Tenant Admin</option>
                </select>

                <button
                    onClick={createInvite}
                    className="px-4 py-2 text-white bg-blue-600"
                >
                    Create Invite
                </button>
            </div>

            <table className="w-full border">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Expires</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {invites.map((invite) => (
                        <tr key={invite.id}>
                            <td>{invite.email}</td>
                            <td>{invite.role}</td>
                            <td>{new Date(invite.expiresAt).toLocaleDateString()}</td>
                            <td>
                                <button
                                    onClick={() => deleteInvite(invite.id)}
                                    className="text-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}