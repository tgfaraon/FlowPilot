import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function Login() {
    const [searchParams] = useSearchParams();
    const roleHint = searchParams.get("role") || "user";

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError("Invalid credentials");
                return;
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);

            const payload = JSON.parse(atob(data.token.split(".")[1]));
            console.log("Decoded JWT:", payload);

            localStorage.setItem("role", payload.role);
            localStorage.setItem("tenantId", payload.tenantId || "");

            // ✅ Route based on role
            if (payload.role === "platformAdmin") {
                navigate("/platform/dashboard");
            } else if (payload.role === "tenantAdmin" || payload.role === "admin") {
                // accept both for compatibility
                navigate("/tenant/dashboard");
            } else {
                navigate("/user/dashboard");
            }
        } catch {
            setError("Login failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="mb-4 text-2xl font-bold">Login as {roleHint}</h2>

            <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 bg-white rounded shadow w-80"
            >
                {error && (
                    <div className="p-2 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-3 py-2 text-white rounded ${loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Logging in…" : "Login"}
                </button>
            </form>
        </div>
    );
}