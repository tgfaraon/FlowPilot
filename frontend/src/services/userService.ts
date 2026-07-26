import axios from "axios";

export async function fetchUsers() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function promoteUser(id: string) {
    await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/promote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
}

export async function demoteUser(id: string) {
    await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/demote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
}

export async function deleteUser(id: string) {
    await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
}

export async function getTenants() {
    try {
        const res = await axios.get("/api/tenants"); // adjust path if needed
        return res.data;
    } catch (err) {
        console.error("Failed to fetch tenants", err);
        throw err;
    }
}

export async function createTenant(name: string) {
    const token = localStorage.getItem("token"); // or however you store it
    const res = await axios.post(
        "/api/tenants",
        { name, domain: `${name.toLowerCase()}.demo` }, // add domain if required
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data;
}

export async function getTenantById(id: string) {
    const res = await axios.get(`/api/tenants/${id}`);
    return res.data;
}

export async function assignTenantAdmin(id: string, email: string) {
    const token = localStorage.getItem("token"); // adjust if you store it differently
    const res = await axios.post(
        `/api/tenants/${id}/assign-admin`,
        { email },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data;
}

export async function createInvite(tenantId: string, email: string, role: string) {
    const token = localStorage.getItem("token");
    const res = await axios.post(
        "/api/tenants/invites",
        { tenantId, email, role },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
}