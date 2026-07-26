import axios from "axios";

export type WorkflowStatus =
    | "pending"
    | "running"
    | "paused"
    | "completed"
    | "failed"
    | "cancelled";

export interface WorkflowSummary {
    id: string;
    workflowName: string;
    userEmail: string;
    status: WorkflowStatus;
    createdAt: string;
    tenantId?: string;
}

export interface WorkflowStep {
    id: string;
    stepId: string;
    name: string;
    type: "WAIT" | "MANUAL_REVIEW" | "WEBHOOK" | "ACTION" | "PARALLEL";
    status: WorkflowStatus;
    createdAt: string;
    logs?: string[];
}

export interface WorkflowLog {
    id: string;
    stepId: string;
    status: string;
    message: string | null;
    createdAt: string;
}

// Base API URL from frontend .env
const API_URL = import.meta.env.VITE_API_URL;

// Helper to inject JWT
function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

/* -------------------------------------------------------
   END USER WORKFLOWS  (GET /api/my)
   ------------------------------------------------------- */
export async function fetchWorkflows(): Promise<WorkflowSummary[]> {
    const res = await axios.get(`${API_URL}/api/my`, {
        headers: authHeaders(),
    });

    const data = res.data;

    // Backend returns [] or a single object — normalize to array
    if (Array.isArray(data)) return data;
    return [data];
}

/* -------------------------------------------------------
   TENANT ADMIN WORKFLOWS  (GET /api/tenant/workflows)
   ------------------------------------------------------- */
export async function fetchTenantWorkflows(): Promise<WorkflowSummary[]> {
    const res = await axios.get(`${API_URL}/api/tenant/workflows`, {
        headers: authHeaders(),
    });
    return res.data;
}

/* -------------------------------------------------------
   PLATFORM ADMIN WORKFLOWS  (GET /api/workflows)
   ------------------------------------------------------- */
export async function fetchAllWorkflows(): Promise<WorkflowSummary[]> {
    const res = await axios.get(`${API_URL}/api/workflows`, {
        headers: authHeaders(),
    });
    return res.data;
}

/* -------------------------------------------------------
   WORKFLOW DETAIL
   ------------------------------------------------------- */
export async function fetchWorkflowDetail(
    workflowId: string
): Promise<{ steps: WorkflowStep[]; logs: WorkflowLog[] }> {
    const res = await fetch(`${API_URL}/api/workflows/${workflowId}`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        throw new Error("Failed to fetch workflow detail");
    }
    return res.json();
}

/* -------------------------------------------------------
   WORKFLOW ACTIONS
   ------------------------------------------------------- */
export async function resumeWorkflow(instanceId: string) {
    return axios.post(`${API_URL}/api/workflow/run/${instanceId}`, {}, {
        headers: authHeaders(),
    });
}

export async function cancelWorkflow(id: string) {
    const res = await axios.post(`${API_URL}/api/workflows/${id}/cancel`, {}, {
        headers: authHeaders(),
    });
    return res.data;
}

/* -------------------------------------------------------
   MOCK DATA (unchanged)
   ------------------------------------------------------- */
export const mockWorkflows: WorkflowSummary[] = [
    {
        id: "1",
        workflowName: "Job Application",
        userEmail: "demo@enduser.com",
        status: "running",
        createdAt: "2026-07-15T10:00:00Z",
    },
    {
        id: "2",
        workflowName: "Onboarding",
        userEmail: "demo@enduser.com",
        status: "completed",
        createdAt: "2026-07-14T09:00:00Z",
    },
    {
        id: "3",
        workflowName: "Vendor Approval",
        userEmail: "demo@enduser.com",
        status: "failed",
        createdAt: "2026-07-13T08:00:00Z",
    },
    {
        id: "4",
        workflowName: "Expense Report",
        userEmail: "demo@enduser.com",
        status: "completed",
        createdAt: "2026-07-12T07:00:00Z",
    },
];

export const mockSteps: WorkflowStep[] = [
    {
        id: "s1",
        stepId: "WAIT_1",
        name: "Initial Wait",
        type: "WAIT",
        status: "completed",
        createdAt: "2026-07-15T10:05:00Z",
        logs: ["Waited for 5 minutes"],
    },
    {
        id: "s2",
        stepId: "REVIEW_1",
        name: "Manual Review",
        type: "MANUAL_REVIEW",
        status: "running",
        createdAt: "2026-07-15T10:10:00Z",
        logs: ["Reviewer assigned"],
    },
    {
        id: "s3",
        stepId: "WEBHOOK_1",
        name: "Webhook Call",
        type: "WEBHOOK",
        status: "pending",
        createdAt: "2026-07-15T10:15:00Z",
    },
];

export const mockLogs: WorkflowLog[] = [
    {
        id: "l1",
        stepId: "WAIT_1",
        status: "completed",
        message: "Wait finished successfully",
        createdAt: "2026-07-15T10:05:00Z",
    },
    {
        id: "l2",
        stepId: "REVIEW_1",
        status: "running",
        message: "Reviewer is checking application",
        createdAt: "2026-07-15T10:12:00Z",
    },
];