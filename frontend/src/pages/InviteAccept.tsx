import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

export default function InviteAccept() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Invalid invite link.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/api/auth/register/${token}`, form);
            navigate("/login");
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ error: string }>;
            const msg = axiosErr.response?.data?.error || "Registration failed";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md p-6 mx-auto mt-10 bg-white shadow">
            <h1 className="mb-4 text-xl font-bold">Accept Invite</h1>

            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
}