import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}