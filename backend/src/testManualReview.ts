import { PrismaClient } from "@prisma/client";
import { executeManualReview, resumeManualReview } from "./engine/steps/manualReview";

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
    const tenant = await prisma.tenant.create({ data: { id: "tenant_review", name: "Review Tenant" } });
    const endUser = await prisma.endUser.create({ data: { id: "enduser_review", email: "review@example.com", tenantId: tenant.id } });
    await prisma.workflowTemplate.create({
        data: { id: "wf_review", name: "Review Workflow", tenantId: tenant.id, type: "MANUAL_REVIEW" }
    });
    await prisma.application.create({ data: { id: "app_review", tenantId: tenant.id, workflowId: "wf_review", userId: endUser.id } });

    // Step + Instance
    await prisma.workflowStep.create({ data: { id: "step_review", workflowId: "wf_review", type: "MANUAL_REVIEW" as any, name: "Manual Review Step" } });
    const instance = await prisma.workflowInstance.create({
        data: { id: "instance_review", workflowId: "wf_review", applicationId: "app_review", currentStepId: "step_review", status: "running", tenantId: "tenant_test" }
    });

    // Execute manual review (pauses)
    await executeManualReview(instance.id, "step_review");

    // Simulate reviewer decision
    await resumeManualReview(instance.id, "approved");

    // Logs
    const logs = await prisma.workflowExecutionLog.findMany({ where: { instanceId: instance.id }, orderBy: { createdAt: "asc" } });
    console.log("Logs for manual review:", logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());