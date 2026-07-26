import { Link } from "react-router-dom";

export default function Sidebar() {
    const role = localStorage.getItem("role");

    return (
        <aside className="w-64 min-h-screen p-4 text-white bg-gray-800">
            <ul className="space-y-2">
                {role === "platformAdmin" && (
                    <>
                        <li><Link to="/platform/dashboard">Platform Dashboard</Link></li>
                        <li><Link to="/platform/workflows">All Workflows</Link></li>
                        <li><Link to="/platform/tenants">Tenants</Link></li>
                    </>
                )}

                {role === "tenantAdmin" && (
                    <>
                        <li><Link to="/tenant/dashboard">Tenant Dashboard</Link></li>
                        <li><Link to="/tenant/workflows">Tenant Workflows</Link></li>
                        <li><Link to="/tenant/templates">Template Manager</Link></li>
                        <li><Link to="/tenant/users">User Management</Link></li>
                        <li><Link to="/tenant/invites">Invite Manager</Link></li>
                    </>
                )}

                {role === "user" && (
                    <>
                        <li><Link to="/user/dashboard">User Dashboard</Link></li>
                        <li><Link to="/user/applications">My Applications</Link></li>
                    </>
                )}
            </ul>
        </aside>
    );
}