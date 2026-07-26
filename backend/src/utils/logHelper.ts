import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fetch execution logs for a workflow instance.
 * @param instanceId - The workflow instance ID
 * @param statusFilter - Optional status filter (e.g. "paused", "resumed", "completed")
 */
export async function getLogs(instanceId: string, statusFilter?: string) {
    return prisma.workflowExecutionLog.findMany({
        where: {
            instanceId,
            ...(statusFilter ? { status: statusFilter } : {})
        },
        orderBy: { createdAt: "asc" }
    });
}