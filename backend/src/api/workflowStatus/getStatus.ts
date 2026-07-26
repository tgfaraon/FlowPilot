import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface WorkflowParams {
    instanceId: string;
}

export default async function getStatus(req: Request<WorkflowParams>, res: Response) {
    const { instanceId } = req.params;

    const instance = await prisma.workflowInstance.findUnique({
        where: { id: instanceId }
    });

    if (!instance) return res.status(404).json({ error: "Instance not found" });

    return res.json({
        id: instance.id,
        status: instance.status,
        currentStepId: instance.currentStepId
    });
}