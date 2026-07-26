import { PrismaClient } from "@prisma/client";
import { advance } from "../flowEngine";
import { logStepOutcome } from "../../utils/logStepOutcome";
import { normalizeConfig } from "../../utils/configHelper";

const prisma = new PrismaClient();

type ManualConfig = {
    payload?: any;
};

export async function executeManualReview(instanceId: string, stepId: string, config?: any) {
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) throw new Error("Instance not found");

    const normalized = normalizeConfig<ManualConfig>(config);

    await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: "waiting_manual" }
    });

    await logStepOutcome(
        instanceId,
        stepId,
        instance.tenantId ?? "default-tenant",
        "MANUAL",
        "paused",
        "Waiting for manual review"
    );

    console.log(`Workflow paused for manual action on step ${stepId}`);
}

export async function resumeManualReview(
    instanceId: string,
    decision: "approved" | "rejected",
    payload?: any
) {
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) throw new Error("Instance not found");

    const approved = decision === "approved";

    await logStepOutcome(
        instanceId,
        instance.currentStepId!,
        instance.tenantId ?? "default-tenant",
        "MANUAL",
        "resumed",
        approved ? "Manual review approved" : "Manual review rejected"
    );

    await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: {
            status: approved ? "running" : "completed",
            manualPayload: payload || null
        }
    });

    if (approved) {
        await advance(instanceId);
    }
}

export async function resumeManualStep(instanceId: string, approved: boolean, payload?: any) {
    return resumeManualReview(instanceId, approved ? "approved" : "rejected", payload);
}