import { PrismaClient } from "@prisma/client";
import { executeWait } from "./engine/flowEngine";
import { executeManualReview, resumeManualReview } from "./engine/steps/manualReview";
import { executeWebhook } from "./engine/steps/webhook";

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
    const tenant = await prisma.tenant.create({ data: { id: "tenant_full", name: "Full Workflow Tenant" } });
    const endUser = await prisma.endUser.create({ data: { id: "enduser_full", email: "full@example.com", tenantId: tenant.id } });
    await prisma.workflowTemplate.create({
        data: { id: "wf_full", name: "Full Workflow", tenantId: tenant.id, type: "ACTION" }
    });
    await prisma.application.create({ data: { id: "app_full", tenantId: tenant.id, workflowId: "wf_full", userId: endUser.id } });

    // Steps
    await prisma.workflowStep.create({ data: { id: "step_wait", workflowId: "wf_full", type: "WAIT" as any, name: "Wait Step", config: { delayMs: 2000 } } });
    await prisma.workflowStep.create({ data: { id: "step_review", workflowId: "wf_full", type: "MANUAL_REVIEW" as any, name: "Manual Review Step" } });
    await prisma.workflowStep.create({ data: { id: "step_webhook", workflowId: "wf_full", type: "WEBHOOK" as any, name: "Webhook Step" } });

    // Instance
    const instance = await prisma.workflowInstance.create({
        data: { id: "instance_full", workflowId: "wf_full", applicationId: "app_full", currentStepId: "step_wait", status: "running", tenantId: "tenant_test" }
    });

    await executeWait(instance.id, "step_wait", { delayMs: 2000 });
    await executeManualReview(instance.id, "step_review");
    await resumeManualReview(instance.id, "approved");
    await executeWebhook(instance.id, "step_webhook", {
        url: "https://jsonplaceholder.typicode.com/posts",
        payload: { test: "FlowPilot webhook" }
    });

    // Logs
    const logs = await prisma.workflowExecutionLog.findMany({ where: { instanceId: instance.id }, orderBy: { createdAt: "asc" } });
    console.log("Logs for full workflow:", logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());