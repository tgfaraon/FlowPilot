import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import type { WorkflowSummary } from "../services/workflowService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    workflows: WorkflowSummary[];
}

export default function WorkflowStatusChart({ workflows }: Props) {
    // Normalize status values to lowercase for consistency
    const normalize = (s: string | undefined) => (s ? s.toLowerCase() : "");

    const statusCounts = {
        running: workflows.filter((w) => normalize(w.status) === "running").length,
        completed: workflows.filter((w) => normalize(w.status) === "completed").length,
        failed: workflows.filter((w) => normalize(w.status) === "failed").length,
    };

    const data = {
        labels: ["Running", "Completed", "Failed"],
        datasets: [
            {
                label: "Workflow Count",
                data: [statusCounts.running, statusCounts.completed, statusCounts.failed],
                backgroundColor: ["#facc15", "#22c55e", "#ef4444"],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Workflow Status Distribution" },
        },
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <Bar data={data} options={options} />
        </div>
    );
}