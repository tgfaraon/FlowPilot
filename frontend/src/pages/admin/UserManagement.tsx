import { useEffect, useState } from "react";
import { fetchUsers, promoteUser, demoteUser, deleteUser } from "../../services/userService";

interface User {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers()
            .then(setUsers)
            .catch(() => setError("Unable to load users. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    async function handlePromote(id: string) {
        await promoteUser(id);
        setUsers(users.map(u => u.id === id ? { ...u, role: "platformAdmin" } : u));
    }

    async function handleDemote(id: string) {
        await demoteUser(id);
        setUsers(users.map(u => u.id === id ? { ...u, role: "user" } : u));
    }

    async function handleDelete(id: string) {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
    }

    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-gray-600">Manage roles and accounts.</p>
            </header>

            {loading && <p>Loading users…</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <table className="w-full text-left border-collapse bg-white rounded shadow">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">{u.role}</td>
                                <td className="p-2">{new Date(u.createdAt).toLocaleString()}</td>
                                <td className="p-2 space-x-2">
                                    {u.role !== "platformAdmin" ? (
                                        <button
                                            onClick={() => handlePromote(u.id)}
                                            className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Promote
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDemote(u.id)}
                                            className="px-2 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Demote
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}