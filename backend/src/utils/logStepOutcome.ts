import { prisma } from "../lib/db";

export async function logStepOutcome(
    instanceId: string,
    stepId: string,
    tenantId: string,
    stepType: string,
    status: "running" | "completed" | "failed" | "compensated" | "retry" | "paused" | "resumed",
    message: string
) {
    // Write execution log
    await prisma.workflowExecutionLog.create({
        data: {
            instanceId,
            stepId,
            status,
            message
        }
    });

    // Update metrics
    await prisma.workflowMetrics.upsert({
        where: { tenantId_stepType: { tenantId, stepType } },
        update: {
            successes: { increment: status === "completed" ? 1 : 0 },
            failures: { increment: status === "failed" ? 1 : 0 },
            retries: { increment: status === "retry" ? 1 : 0 }
        },
        create: {
            tenantId,
            stepType,
            successes: status === "completed" ? 1 : 0,
            failures: status === "failed" ? 1 : 0,
            retries: status === "retry" ? 1 : 0
        }
    });
}