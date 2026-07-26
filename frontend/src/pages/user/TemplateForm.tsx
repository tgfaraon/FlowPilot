import { useState } from "react";
import { submitTemplate } from "../../services/templateService";

export default function TemplateForm() {
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            await submitTemplate(formData);
            setSuccess(true);
            setFormData({ name: "", description: "" }); // reset form
        } catch {
            setError("Failed to submit template");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-lg p-6 mx-auto">
            <h1 className="mb-6 text-3xl font-bold">Fill Out Template</h1>
            <p className="mb-6 text-gray-600">
                Provide details to start a new workflow.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={4}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-white bg-green-600 rounded shadow hover:bg-green-700 disabled:opacity-50"
                >
                    {submitting ? "Submitting…" : "Submit"}
                </button>
            </form>

            {error && (
                <div className="p-4 mt-4 text-red-700 bg-red-100 rounded">{error}</div>
            )}
            {success && (
                <div className="p-4 mt-4 text-green-700 bg-green-100 rounded">
                    Template submitted successfully!
                </div>
            )}
        </div>
    );
}