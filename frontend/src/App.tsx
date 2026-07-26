import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

// Core pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import WorkflowDetail from "./pages/WorkflowDetail";

// Admin pages
import PlatformAdminDashboard from "./pages/admin/PlatformAdminDashboard";
import TenantAdminDashboard from "./pages/admin/TenantAdminDashboard";
import TemplateManager from "./pages/admin/TemplateManager";
import WorkflowMonitor from "./pages/admin/WorkflowMonitor";
import UserManagement from "./pages/admin/UserManagement";
import InviteManager from "./pages/admin/InviteManager";
import TenantDetail from "./pages/admin/TenantDetail";
import TenantWorkflowList from "./pages/admin/TenantWorkflowList";
import TenantManager from "./pages/admin/TenantManager";
import WorkflowList from "./pages/admin/WorkflowList";

// User pages
import UserDashboard from "./pages/UserDashboard";
import ApplicationList from "./pages/user/ApplicationList";
import ApplicationDetail from "./pages/user/ApplicationDetail";
import TemplateForm from "./pages/user/TemplateForm";

// Public invite acceptance
import InviteAccept from "./pages/InviteAccept";

import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    {/* Entry flow */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* Shared workflow detail */}
                    <Route
                        path="/workflows/:id"
                        element={
                            <Layout>
                                <WorkflowDetail />
                            </Layout>
                        }
                    />

                    {/* Platform Admin routes */}
                    <Route
                        path="/platform/dashboard"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <PlatformAdminDashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/templates"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <TemplateManager />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/workflows"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <WorkflowList />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/workflows/:id"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <WorkflowMonitor />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/users"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <UserManagement />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/invites"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <InviteManager />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/tenants"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <TenantManager />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/platform/tenants/:id"
                        element={
                            <ProtectedRoute requiredRole="platformAdmin">
                                <Layout>
                                    <TenantDetail />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Tenant Admin routes */}
                    <Route
                        path="/tenant/dashboard"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <TenantAdminDashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenant/workflows"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <TenantWorkflowList />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenant/templates"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <TemplateManager />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenant/workflows/:id"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <WorkflowMonitor />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenant/users"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <UserManagement />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tenant/invites"
                        element={
                            <ProtectedRoute requiredRole="tenantAdmin">
                                <Layout>
                                    <InviteManager />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* User routes */}
                    <Route
                        path="/user/dashboard"
                        element={
                            <Layout>
                                <UserDashboard />
                            </Layout>
                        }
                    />
                    <Route
                        path="/user/applications"
                        element={
                            <Layout>
                                <ApplicationList />
                            </Layout>
                        }
                    />
                    <Route
                        path="/user/applications/:id"
                        element={
                            <Layout>
                                <ApplicationDetail />
                            </Layout>
                        }
                    />
                    <Route
                        path="/user/templates"
                        element={
                            <Layout>
                                <TemplateForm />
                            </Layout>
                        }
                    />

                    {/* Public invite acceptance */}
                    <Route
                        path="/invite/:token"
                        element={
                            <Layout>
                                <InviteAccept />
                            </Layout>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;