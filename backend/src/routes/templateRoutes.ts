import express, { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { advance } from "../engine/flowEngine";
import { authMiddleware, AuthRequest } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

function getUser(req: AuthRequest, res: Response) {
    if (!req.user || !req.user.tenantId) {
        res.status(401).json({ error: "Unauthorized: missing user context" });
        return null;
    }
    return req.user as { id: string; tenantId: string; role: string };
}

// List templates — tenant admins
router.get("/templates", authMiddleware, requireRole("tenantAdmin"), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;

    try {
        const templates = await prisma.template.findMany();
        const filtered = (templates as any[]).filter(t => t.tenantId === user.tenantId);

        res.json(filtered);
    } catch {
        res.status(500).json({ error: "Failed to fetch templates" });
    }
});

// Create template — tenant admins
router.post("/templates", authMiddleware, requireRole("tenantAdmin"), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;

    const { name, description } = req.body;
    try {
        const newTemplate = await prisma.template.create({
            data: { name, description, status: "active", tenantId: user.tenantId },
        });
        res.json(newTemplate);
    } catch {
        res.status(500).json({ error: "Failed to create template" });
    }
});

// Delete template — tenant admins
router.delete("/templates/:id", authMiddleware, requireRole("tenantAdmin"), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        await prisma.template.delete({ where: { id } });
        res.json({ success: true });
    } catch {
        res.status(500).json({ error: "Failed to delete template" });
    }
});

// Submit template — tenant admins
router.post("/templates/submit", authMiddleware, requireRole("tenantAdmin"), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;

    const { name, description } = req.body;

    try {
        const template = await prisma.template.create({
            data: { name, description, status: "active", tenantId: user.tenantId },
        });

        const application = await prisma.application.create({
            data: {
                tenantId: user.tenantId,
                workflowId: template.id,
                userId: user.id,
                status: "in_progress",
            },
        });

        const instance = await prisma.workflowInstance.create({
            data: {
                applicationId: application.id,
                workflowId: template.id,
                status: "running",
                tenantId: user.tenantId,
            },
        });

        await advance(instance.id);

        res.json({ workflowId: instance.id, status: instance.status });
    } catch {
        res.status(500).json({ error: "Failed to submit template" });
    }
});

// Approve workflow step — tenant admins
router.post("/workflow/approve/:id", authMiddleware, requireRole("tenantAdmin"), async (req, res) => {
    const user = getUser(req, res);
    if (!user) return;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
        const instance = await prisma.workflowInstance.findUnique({ where: { id } });
        if (!instance) {
            return res.status(404).json({ error: "Workflow instance not found" });
        }

        await prisma.workflowInstance.update({
            where: { id },
            data: { status: "running" },
        });

        await advance(id);

        res.json({ status: "approved", instanceId: id });
    } catch {
        res.status(500).json({ error: "Failed to approve manual step" });
    }
});

export default router;