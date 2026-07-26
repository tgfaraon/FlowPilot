import { PrismaClient } from "@prisma/client";
import { executeConditionalStep } from "./engine/steps/conditionalStep";

const prisma = new PrismaClient();

async function runConditionalWorkflow() {
    // 1. Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: "tenant_conditional" },
        update: {},
        create: { id: "tenant_conditional", name: "Test Tenant" }
    });

    // 2. EndUser (since Application.userId references EndUser)
    const endUser = await prisma.endUser.upsert({
        where: { id: "user_conditional" },
        update: {},
        create: {
            id: "user_conditional",
            email: "user@conditional.test",
            name: "Conditional End User",
            tenantId: tenant.id
        }
    });

    // 3. Workflow template
    const workflow = await prisma.workflowTemplate.upsert({
        where: { id: "wf_conditional" },
        update: {},
        create: {
            id: "wf_conditional",
            tenantId: tenant.id,
            name: "Conditional Workflow"
        }
    });

    // 4. Create WorkflowSteps (so currentStepId points to valid rows)
    await prisma.workflowStep.upsert({
        where: { id: "step_conditional" },
        update: {},
        create: {
            id: "step_conditional",
            workflowId: workflow.id,
            type: "CONDITION",
            name: "Conditional Step"
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
        where: { id: "step_action" },
        update: {},
        create: {
            id: "step_action",
            workflowId: workflow.id,
            type: "ACTION",
            name: "Action Step"
        }
    });

    // 5. Application
    const app = await prisma.application.upsert({
        where: { id: "app_test" },
        update: {},
        create: {
            id: "app_test",
            tenantId: tenant.id,
            workflowId: workflow.id,
            userId: endUser.id
        }
    });

    // 6. Workflow instance (delete if exists, then create fresh)
    await prisma.workflowInstance.deleteMany({ where: { id: "instance_conditional" } });
    const instance = await prisma.workflowInstance.create({
        data: {
            id: "instance_conditional",
            applicationId: app.id,
            workflowId: workflow.id,
            status: "running",
            currentStepId: "step_conditional",
            manualPayload: { status: "pending" },
            tenantId: "tenant_test"
        }
    });

    console.log("Created workflow instance:", instance.id);

    // Config for conditional step
    const config = {
        rule: "application.status == 'pending'",
        onTrue: "step_webhook",
        onFalse: "step_action"
    };

    // Execute conditional step with status = pending
    await executeConditionalStep(instance.id, "step_conditional", config);

    const updated = await prisma.workflowInstance.findUnique({ where: { id: instance.id } });
    console.log("After conditional step → currentStepId:", updated?.currentStepId);

    // Simulate a different payload (status != pending)
    await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { manualPayload: { status: "approved" }, currentStepId: "step_conditional" }
    });

    await executeConditionalStep(instance.id, "step_conditional", config);

    const updated2 = await prisma.workflowInstance.findUnique({ where: { id: instance.id } });
    console.log("After conditional step with approved → currentStepId:", updated2?.currentStepId);
}

runConditionalWorkflow()
    .then(() => {
        console.log("Conditional workflow test completed.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error running conditional workflow test:", err);
        process.exit(1);
    });