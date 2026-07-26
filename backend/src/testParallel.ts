import { prisma } from "./lib/db";
import { advance } from "./engine/flowEngine";

async function testParallel() {
    // 1. Seed a Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: "tenant_test" },
        update: {},
        create: { id: "tenant_test", name: "Test Tenant" }
    });

    // 2. Seed an EndUser
    const user = await prisma.endUser.upsert({
        where: { id: "user_test" },
        update: {},
        create: {
            id: "user_test",
            email: "user@test.local",
            name: "Parallel Tester",
            tenantId: tenant.id
        }
    });

    // 3. Seed a WorkflowTemplate
    const workflow = await prisma.workflowTemplate.upsert({
        where: { id: "workflow_parallel" },
        update: {},
        create: {
            id: "workflow_parallel",
            tenantId: tenant.id,
            name: "Parallel Workflow"
        }
    });

    // 4. Seed WorkflowSteps
    await prisma.workflowStep.upsert({
        where: { id: "step_parallel" },
        update: { config: { parallelSteps: ["step_webhook", "step_manual"] } },
        create: {
            id: "step_parallel",
            workflowId: workflow.id,
            type: "PARALLEL",
            name: "Parallel Step",
            config: { parallelSteps: ["step_webhook", "step_manual"] }
        }
    });

    await prisma.workflowStep.upsert({
        where: { id: "step_webhook" },
        update: {},
        create: {
            id: "step_webhook",
            workflowId: workflow.id,
            type: "WEBHOOK",
            name: "Webhook Step"
        }
    });

    await prisma.workflowStep.upsert({
        where: { id: "step_manual" },
        update: {},
        create: {
            id: "step_manual",
            workflowId: workflow.id,
            type: "MANUAL",
            name: "Manual Step"
        }
    });

    // 5. Seed an Application
    const app = await prisma.application.upsert({
        where: { id: "app_parallel_test" },
        update: {},
        create: {
            id: "app_parallel_test",
            tenantId: tenant.id,
            workflowId: workflow.id,
            userId: user.id,
            status: "in_progress"
        }
    });

    // 6. Create WorkflowInstance pointing to the Application
    const instance = await prisma.workflowInstance.upsert({
        where: { applicationId: app.id },
        update: { currentStepId: "step_parallel", status: "running" },
        create: {
            applicationId: app.id,
            workflowId: workflow.id,
            status: "running",
            currentStepId: "step_parallel",
            tenantId: "tenant_test"
        }
    });

    // 7. Advance the workflow
    await advance(instance.id);

    // 8. Inspect logs
    const logs = await prisma.workflowExecutionLog.findMany({
        where: { instanceId: instance.id }
    });

    console.log("Execution logs:", logs);
}

testParallel().catch(console.error);