import { PrismaClient } from "@prisma/client";
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
    const tenant = await prisma.tenant.create({ data: { id: "tenant_webhook", name: "Webhook Tenant" } });
    const endUser = await prisma.endUser.create({ data: { id: "enduser_webhook", email: "webhook@example.com", tenantId: tenant.id } });
    await prisma.workflowTemplate.create({
        data: { id: "wf_webhook", name: "Webhook Workflow", tenantId: tenant.id, type: "WEBHOOK" }
    });
    await prisma.application.create({ data: { id: "app_webhook", tenantId: tenant.id, workflowId: "wf_webhook", userId: endUser.id } });

    // Step + Instance
    await prisma.workflowStep.create({ data: { id: "step_webhook", workflowId: "wf_webhook", type: "WEBHOOK" as any, name: "Webhook Step" } });
    const instance = await prisma.workflowInstance.create({
        data: { id: "instance_webhook", workflowId: "wf_webhook", applicationId: "app_webhook", currentStepId: "step_webhook", status: "running", tenantId: "tenant_test" }
    });

    await executeWebhook(instance.id, "step_webhook", {
        url: "https://jsonplaceholder.typicode.com/posts",
        payload: { test: "FlowPilot webhook" }
    });

    // Logs
    const logs = await prisma.workflowExecutionLog.findMany({ where: { instanceId: instance.id }, orderBy: { createdAt: "asc" } });
    console.log("Logs for webhook:", logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());