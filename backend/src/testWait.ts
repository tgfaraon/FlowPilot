import { PrismaClient } from "@prisma/client";
import { advance } from "./engine/flowEngine";
import { getLogs } from "./utils/logHelper";

const prisma = new PrismaClient();

async function main() {
    // 🔹 Cleanup block — wipe old test rows
    await prisma.workflowExecutionLog.deleteMany({});
    await prisma.workflowInstance.deleteMany({});
    await prisma.workflowStep.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.workflowTemplate.deleteMany({});
    await prisma.endUser.deleteMany({});
    await prisma.adminUser.deleteMany({});
    await prisma.tenant.deleteMany({});

    // 1. Create Tenant
    const tenant = await prisma.tenant.create({
        data: { id: "tenant_test", name: "Test Tenant" }
    });

    // 2. Create EndUser (Application expects this, not AdminUser)
    const endUser = await prisma.endUser.create({
        data: {
            id: "enduser_test",
            email: "enduser@example.com",
            tenantId: tenant.id
        }
    });

    // 3. Create WorkflowTemplate
    await prisma.workflowTemplate.create({
        data: { id: "wf_test", name: "Test Workflow", tenantId: tenant.id, type: "WAIT" }
    });

    // 4. Create Application (linking tenant, workflow, and EndUser)
    await prisma.application.create({
        data: {
            id: "app_test",
            tenantId: tenant.id,
            workflowId: "wf_test",
            userId: endUser.id
        }
    });

    // 5. Create WAIT step
    await prisma.workflowStep.create({
        data: {
            id: "step_wait_test",
            workflowId: "wf_test",
            type: "WAIT",
            name: "Test Wait",
            config: { delayMs: 3000 }
        }
    });

    // 6. Create WorkflowInstance
    const instance = await prisma.workflowInstance.create({
        data: {
            id: "instance_wait_test",
            workflowId: "wf_test",
            applicationId: "app_test",
            currentStepId: "step_wait_test",
            status: "running",
            tenantId: "tenant_test"
        }
    });

    // 7. Advance workflow (this should hit WAIT and log)
    await advance(instance.id);

    // 8. Fetch logs back
    const logs = await getLogs(instance.id, "resumed"); // optional filter
    console.log("Logs for instance:", logs);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });