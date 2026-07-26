export interface TemplateSummary {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

const API_BASE_URL = "http://localhost:3001/api";

// Helper to inject JWT
function authHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// --- API calls ---
export async function fetchTemplates(): Promise<TemplateSummary[]> {
    const res = await fetch(`${API_BASE_URL}/templates`, {
        headers: authHeaders(),
    });
    if (!res.ok) {
        throw new Error("Failed to load templates");
    }
    return res.json();
}

export async function createTemplate(template: {
    name: string;
    description: string;
}): Promise<TemplateSummary> {
    const res = await fetch(`${API_BASE_URL}/templates`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(template),
    });
    if (!res.ok) {
        throw new Error("Failed to create template");
    }
    return res.json();
}

export async function submitTemplate(template: {
    name: string;
    description: string;
}): Promise<TemplateSummary> {
    return createTemplate(template);
}

export async function deleteTemplate(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) {
        throw new Error("Failed to delete template");
    }
}