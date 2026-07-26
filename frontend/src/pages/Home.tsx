import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="mb-4 text-4xl font-bold">FlowPilot</h1>
            <p className="mb-8 text-gray-600">Workflow automation made simple</p>
            <div className="space-x-4">
                <Link
                    to="/login?role=admin"
                    className="px-6 py-3 text-white bg-blue-600 rounded shadow"
                >
                    Login as Admin
                </Link>
                <Link
                    to="/login?role=user"
                    className="px-6 py-3 text-white bg-green-600 rounded shadow"
                >
                    Login as User
                </Link>
            </div>
        </div>
    );
}