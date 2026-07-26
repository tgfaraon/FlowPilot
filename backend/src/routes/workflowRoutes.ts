import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { advance } from "../engine/flowEngine";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";
import { AuthenticatedRequest } from "../types/authenticated-request";

const prisma = new PrismaClient();
const router = express.Router();

// End users & admins can view workflows
router.get("/workflows", authMiddleware, async (req, res: Response) => {
    try {
        const instances = await prisma.workflowInstance.findMany({
            orderBy: { createdAt: "desc" },
            include: { workflow: true },
        });

        const formatted = instances.map((inst) => ({
            id: inst.id,
            name: inst.workflow?.name ?? "(unnamed workflow)",
            status: inst.status,
            createdAt: inst.createdAt,
            type: inst.workflow?.type ?? "unknown",
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch workflows" });
    }
});

router.get("/workflows/:id", authMiddleware, async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
        const instance = await prisma.workflowInstance.findUnique({
            where: { id },
            include: { steps: true },
        });

        if (!instance) {
            return res.status(404).json({ error: "Workflow instance not found" });
        }

        const logs = await prisma.workflowExecutionLog.findMany({
            where: { instanceId: id },
            orderBy: { createdAt: "asc" },
        });

        res.json({
            steps: instance.steps.map((s) => ({
                id: s.id,
                stepId: s.stepId,
                status: s.status,
                createdAt: s.createdAt,
            })),
            logs: logs.map((log) => ({
                id: log.id,
                stepId: log.stepId,
                status: log.status,
                message: log.message,
                createdAt: log.createdAt,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to load workflow details" });
    }
});

router.get("/my", authMiddleware, async (req, res) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const userId = user.id;

    const applications = await prisma.application.findMany({
        where: { userId },
        select: { id: true },
    });

    const appIds = applications.map(app => app.id);

    const workflows = await prisma.workflowInstance.findMany({
        where: { applicationId: { in: appIds } },
        orderBy: { createdAt: "desc" },
    });

    const summaries = workflows.map(wf => ({
        id: wf.id,
        workflowName: wf.workflowId,
        userEmail: user.email,
        status: wf.status,
        createdAt: wf.createdAt,
    }));

    res.json(summaries);
});

router.get(
    "/tenant/workflows",
    authMiddleware,
    requireRole("tenantAdmin"),
    async (req, res: Response) => {
        const user = (req as AuthenticatedRequest).user;
        if (!user || !user.tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const workflows = await prisma.workflowInstance.findMany({
                where: {
                    application: {
                        tenantId: user.tenantId
                    }
                },
                orderBy: { createdAt: "desc" },
                include: {
                    application: { include: { user: true } },
                    workflow: true
                }
            });

            const summaries = workflows.map(wf => ({
                id: wf.id,
                workflowName: wf.workflow?.name ?? "(unnamed workflow)",
                userEmail: wf.application?.user?.email ?? "unknown",
                status: wf.status,
                createdAt: wf.createdAt,
                tenantId: wf.application?.tenantId
            }));

            return res.json(summaries);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch tenant workflows" });
        }
    }
);

// Only admins can trigger workflow runs
router.post(
    "/workflow/run/:id",
    authMiddleware,
    requireRole("tenantAdmin"),
    async (req, res: Response) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        try {
            const instance = await prisma.workflowInstance.update({
                where: { id },
                data: { status: "running" }
            });
            return res.json(instance);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to resume workflow" });
        }
    }
);

router.post(
    "/workflows/:id/cancel",
    authMiddleware,
    requireRole("tenantAdmin"),
    async (req, res: Response) => {
        const { id } = req.params;
        const workflowId = Array.isArray(id) ? id[0] : id;

        try {
            const instance = await prisma.workflowInstance.update({
                where: { id: workflowId },
                data: { status: "cancelled" },
            });
            return res.json(instance);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to cancel workflow" });
        }
    }
);

export default router;