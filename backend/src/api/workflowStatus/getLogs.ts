import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface WorkflowParams {
    instanceId: string;
}

export default async function getLogs(req: Request<WorkflowParams>, res: Response) {
    const { instanceId } = req.params;

    const logs = await prisma.workflowExecutionLog.findMany({
        where: { instanceId },
        orderBy: { createdAt: "asc" }
    });

    return res.json(logs);
}