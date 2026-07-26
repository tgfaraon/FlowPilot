import type { ReactNode } from "react";

type Props = {
    loading: boolean;
    error?: string | null;
    children: ReactNode;
};

function LoadingError({ loading, error, children }: Props) {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 text-red-700 rounded">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return <>{children}</>;
}

export default LoadingError;