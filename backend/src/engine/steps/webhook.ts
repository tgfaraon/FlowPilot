import { PrismaClient } from "@prisma/client";
import { logStepOutcome } from "../../utils/logStepOutcome";
import { normalizeConfig } from "../../utils/configHelper";

const prisma = new PrismaClient();

type WebhookConfig = {
    url: string;
    payload?: any;
};

export async function executeWebhook(instanceId: string, stepId: string, config: any) {
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) throw new Error("Instance not found");

    const normalized = normalizeConfig<WebhookConfig>(config);

    await logStepOutcome(
        instanceId,
        stepId,
        instance.tenantId ?? "default-tenant",
        "WEBHOOK",
        "running",
        `Calling webhook ${normalized.url}`
    );

    try {
        const response = await fetch(normalized.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalized.payload)
        });

        const result = await response.json();

        await logStepOutcome(
            instanceId,
            stepId,
            instance.tenantId ?? "default-tenant",
            "WEBHOOK",
            "completed",
            `Webhook success: ${JSON.stringify(result)}`
        );

        await prisma.workflowInstance.update({
            where: { id: instanceId },
            data: { status: "running" }
        });
    } catch (err: any) {
        await logStepOutcome(
            instanceId,
            stepId,
            instance.tenantId ?? "default-tenant",
            "WEBHOOK",
            "failed",
            `Webhook failed: ${err.message}`
        );

        await prisma.workflowInstance.update({
            where: { id: instanceId },
            data: { status: "terminated" }
        });
    }
}