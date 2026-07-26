import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    fetchTemplates,
    createTemplate,
    deleteTemplate,
} from "../../services/templateService";
import type { TemplateSummary } from "../../services/templateService";

export default function TemplateManager() {
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchTemplates();
                setTemplates(data);
            } catch {
                setError("Failed to load templates");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newName.trim()) {
            setError("Template name is required");
            return;
        }

        setCreating(true);
        try {
            const newTemplate = await createTemplate({
                name: newName,
                description: newDescription || "No description",
            });
            setTemplates([...templates, newTemplate]);
            setNewName("");
            setNewDescription("");
        } catch {
            setError("Failed to create template");
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteTemplate(id);
            setTemplates(templates.filter((t) => t.id !== id));
        } catch {
            setError("Failed to delete template");
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading templates…</span>
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
            <h1 className="text-3xl font-bold">Template Manager</h1>
            <p className="text-gray-600">Create and manage workflow templates.</p>

            {/* Create form */}
            <form
                onSubmit={handleCreate}
                className="flex flex-col gap-3 p-4 rounded shadow bg-gray-50 w-96"
            >
                <input
                    type="text"
                    placeholder="Template name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                    placeholder="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    disabled={creating}
                    className={`px-4 py-2 text-white rounded ${creating
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {creating ? "Creating…" : "Create Template"}
                </button>
            </form>

            {/* Template list */}
            <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                    <div
                        key={t.id}
                        className="p-5 transition bg-white border rounded-lg shadow-sm hover:shadow-md"
                    >
                        <h2 className="text-lg font-semibold">{t.name}</h2>
                        <p className="text-xs text-gray-400">ID: {t.id}</p>
                        <p className="mt-2 text-sm text-gray-500">{t.description}</p>

                        <div className="flex gap-3 mt-3">
                            <Link
                                to={`/admin/templates/${t.id}`}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}