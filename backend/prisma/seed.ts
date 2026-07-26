import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const hashedPlatformPassword = await bcrypt.hash("SuperSecurePassword123", 10);
    const hashedTenantAdminPassword = await bcrypt.hash("password123", 10);

    // 1. Ensure permanent PlatformAdmin exists (no tenantId)
    await prisma.adminUser.upsert({
        where: { email: "tylergfaraon@gmail.com" },
        update: {
            role: "platformAdmin",
            hashedPassword: hashedPlatformPassword,
        },
        create: {
            email: "tylergfaraon@gmail.com",
            name: "Tyler Global",
            role: "platformAdmin",
            hashedPassword: hashedPlatformPassword,
        },
    });

    // 2. Create Demo Tenant
    const tenant = await prisma.tenant.create({
        data: { name: "DemoTenant" },
    });

    // 3. Create Tenant Admin
    await prisma.adminUser.upsert({
        where: { email: "sample.admin@example.com" },
        update: {
            role: "tenantAdmin",
            tenantId: tenant.id,
            hashedPassword: hashedTenantAdminPassword,
        },
        create: {
            email: "sample.admin@example.com",
            name: "Sample Tenant Admin",
            role: "tenantAdmin",
            tenantId: tenant.id,
            hashedPassword: hashedTenantAdminPassword,
        },
    });

    // 4. Create End User
    const user = await prisma.endUser.upsert({
        where: { email: "tgfaraon@gmail.com" },
        update: {},
        create: {
            email: "tgfaraon@gmail.com",
            tenantId: tenant.id,
        },
    });

    // 5. Create WorkflowTemplate
    const workflow = await prisma.workflowTemplate.create({
        data: {
            name: "DemoWorkflow",
            tenantId: tenant.id,
        },
    });

    // 6. Create WorkflowSteps
    const waitStep = await prisma.workflowStep.create({
        data: {
            type: "WAIT",
            name: "Wait Step",
            workflowId: workflow.id,
        },
    });

    const actionStep = await prisma.workflowStep.create({
        data: {
            type: "ACTION",
            name: "Action Step",
            workflowId: workflow.id,
            nextStepId: waitStep.id,
        },
    });

    // 7. Create multiple Applications + Instances with varied statuses
    const statuses = ["running", "paused", "completed", "failed", "cancelled"];
    for (const status of statuses) {
        // Create a new application for each instance
        const application = await prisma.application.create({
            data: {
                tenantId: tenant.id,
                workflowId: workflow.id,
                userId: user.id,
                currentStepId: waitStep.id,
            },
        });

        const instance = await prisma.workflowInstance.create({
            data: {
                applicationId: application.id, // unique per application
                workflowId: workflow.id,
                currentStepId: waitStep.id,
                status,
            },
        });

        const stepWaitExec = await prisma.stepExecution.create({
            data: {
                applicationId: application.id,
                instanceId: instance.id,
                stepId: waitStep.id,
                status: status === "failed" ? "failed" : "completed",
            },
        });

        const stepActionExec = await prisma.stepExecution.create({
            data: {
                applicationId: application.id,
                instanceId: instance.id,
                stepId: actionStep.id,
                status: status === "running" ? "pending" : status,
            },
        });

        await prisma.workflowExecutionLog.createMany({
            data: [
                {
                    instanceId: instance.id,
                    stepId: stepWaitExec.id,
                    status: stepWaitExec.status,
                    message: "WAIT step processed",
                },
                {
                    instanceId: instance.id,
                    stepId: stepActionExec.id,
                    status: stepActionExec.status,
                    message: `Action step is ${stepActionExec.status}`,
                },
            ],
        });

        console.log(`✅ Seeded workflow instance ${instance.id} with status ${status}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });