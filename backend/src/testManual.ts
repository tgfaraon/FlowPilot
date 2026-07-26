import { PrismaClient } from "@prisma/client";
import { advance } from "./engine/flowEngine";

const prisma = new PrismaClient();

async function run() {
    // 1. Create a fresh instance
    await prisma.workflowInstance.create({
        data: {
            id: "instance_manual_test",
            applicationId: "app_test",       // <-- use your real application ID
            workflowId: "wf_test",
            currentStepId: "step_manual_test",
            status: "waiting_manual"
        }
    });

    // 2. Advance it
    await advance("instance_manual_test");
}

run();
