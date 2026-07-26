import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <nav className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
            {/* Left: Brand */}
            <Link to="/" className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">FlowPilot</span>
            </Link>

            {/* Right: Nav items */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
                <Link
                    to="/"
                    className="hover:text-gray-900 transition"
                >
                    Workflows
                </Link>

                <button
                    className="text-gray-400 hover:text-gray-600 transition cursor-default"
                >
                    Settings (soon)
                </button>
            </div>
        </nav>
    );
}