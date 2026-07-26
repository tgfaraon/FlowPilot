import { PrismaClient } from "@prisma/client";
import { executeWait } from "./engine/flowEngine";
import { executeManual } from "./engine/flowEngine";
import { executeWebhook } from "./engine/steps/webhook";
import { executeAction } from "./engine/flowEngine";

const prisma = new PrismaClient();

async function main() {
    // Cleanup
    await prisma.workflowExecutionLog.deleteMany({});
    await prisma.workflowInstance.deleteMany({});
    await prisma.workflowStep.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.workflowTemplate.deleteMany({});
    await prisma.endUser.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.adminUser.deleteMany({});

    // Tenant + EndUser + WorkflowTemplate + Application
    const tenant = await prisma.tenant.create({ data: { id: "tenant_full_action", name: "Tenant Full Action" } });
    const endUser = await prisma.endUser.create({ data: { id: "enduser_full_action", email: "action@example.com", tenantId: tenant.id } });
    await prisma.workflowTemplate.create({
        data: { id: "wf_full_action", name: "Full Workflow With Action", tenantId: tenant.id, type: "ACTION" }
    });
    await prisma.application.create({ data: { id: "app_full_action", tenantId: tenant.id, workflowId: "wf_full_action", userId: endUser.id } });

    // Steps
    await prisma.workflowStep.create({
        data: {
            id: "step_wait",
            workflowId: "wf_full_action",
            type: "WAIT" as any,
            name: "Wait Step",
            config: { delayMs: 2000 }
        }
    });

    await prisma.workflowStep.create({
        data: {
            id: "step_review",
            workflowId: "wf_full_action",
            type: "MANUAL" as any,
            name: "Manual Review Step"
        }
    });

    await prisma.workflowStep.create({
        data: {
            id: "step_webhook",
            workflowId: "wf_full_action",
            type: "WEBHOOK" as any,
            name: "Webhook Step"
        }
    });

    await prisma.workflowStep.create({
        data: {
            id: "step_action",
            workflowId: "wf_full_action",
            type: "ACTION" as any,
            name: "Action Step",
            config: { action: "update_application", field: "status", value: "approved" }
        }
    });

    // 2. Now safely wire the nextStepId chain
    await prisma.workflowStep.update({
        where: { id: "step_wait" },
        data: { nextStepId: "step_review" }
    });

    await prisma.workflowStep.update({
        where: { id: "step_review" },
        data: { nextStepId: "step_webhook" }
    });

    await prisma.workflowStep.update({
        where: { id: "step_webhook" },
        data: { nextStepId: "step_action" }
    });

    // Instance
    const instance = await prisma.workflowInstance.create({
        data: { id: "instance_full_action", workflowId: "wf_full_action", applicationId: "app_full_action", currentStepId: "step_wait", status: "running", tenantId: "tenant_test" }
    });

    await executeWait(instance.id, "step_wait", { delayMs: 2000 });
    await executeManual(instance, { id: "step_review", workflowId: "wf_full_action", type: "MANUAL" as any, name: "Manual Review Step", nextStepId: "step_webhook", config: {} } as any);
    await prisma.workflowExecutionLog.create({
        data: { instanceId: instance.id, stepId: "step_review", status: "resumed", message: "Manual review approved" }
    });
    await executeWebhook(instance.id, "step_webhook", {
        url: "https://jsonplaceholder.typicode.com/posts",
        payload: { test: "FlowPilot webhook" }
    });
    await executeAction(instance, { id: "step_action", workflowId: "wf_full_action", type: "ACTION" as any, name: "Action Step", config: { action: "update_application", field: "status", value: "approved" } } as any);

    // Logs
    const logs = await prisma.workflowExecutionLog.findMany({ where: { instanceId: instance.id }, orderBy: { createdAt: "asc" } });
    console.log("Logs for full workflow with ACTION:", logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());