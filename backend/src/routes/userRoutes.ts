import { Router } from "express";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";

const router = Router();

// GET all end users
router.get("/", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const tenantId = req.user.tenantId; // ✅ comes from JWT payload

        const users = await prisma.endUser.findMany({
            where: { tenantId },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Promote user (set role via Invite or AdminUser if needed)
router.post("/:id/promote", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tenantId = req.user.tenantId;

    try {
        await prisma.adminUser.create({
            data: {
                email: (await prisma.endUser.findUnique({ where: { id, tenantId } }))?.email!,
                tenantId,
                role: "manager",
            },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to promote user" });
    }
});

router.post("/:id/demote", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tenantId = req.user.tenantId;

    try {
        const endUser = await prisma.endUser.findUnique({ where: { id, tenantId } });
        if (!endUser) return res.status(404).json({ error: "User not found" });

        await prisma.adminUser.deleteMany({
            where: { email: endUser.email, tenantId },
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to demote user" });
    }
});

// Delete end user
router.delete("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tenantId = req.user.tenantId;

    try {
        await prisma.endUser.delete({
            where: { id, tenantId }, // ✅ ensures only within tenant
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;