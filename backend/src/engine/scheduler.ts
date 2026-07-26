import { PrismaClient } from "@prisma/client";
import { advance } from "./flowEngine";

const prisma = new PrismaClient();

export async function runScheduler() {
    const now = new Date();

    const dueInstances = await prisma.workflowInstance.findMany({
        where: {
            status: "paused",
            resumeAt: { lte: now }
        }
    });

    for (const instance of dueInstances) {
        await prisma.workflowInstance.update({
            where: { id: instance.id },
            data: { status: "running", resumeAt: null }
        });

        console.log(`Resuming workflow instance ${instance.id}`);
        await advance(instance.id);
    }
}