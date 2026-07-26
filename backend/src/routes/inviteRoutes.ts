import { Router } from "express";
import { prisma } from "../lib/db";
import crypto from "crypto";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

// ✉️ Create invite — overseer (PlatformAdmin) only
router.post(
    "/",
    authMiddleware,
    requireRole("platformAdmin"),
    async (req, res) => {
        const { tenantId, email, role } = req.body;
        try {
            const invite = await prisma.invite.create({
                data: {
                    tenantId,
                    email,
                    role,
                    token: crypto.randomUUID(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
            res.json(invite);
        } catch (err) {
            res.status(500).json({ error: "Failed to create invite" });
        }
    }
);

// 📜 Get all invites for a tenant — overseer only
router.get(
    "/:tenantId",
    authMiddleware,
    requireRole("platformAdmin"),
    async (req, res) => {
        const tenantId = Array.isArray(req.params.tenantId)
            ? req.params.tenantId[0]
            : req.params.tenantId;

        try {
            const invites = await prisma.invite.findMany({
                where: { tenantId },
            });
            res.json(invites);
        } catch (err) {
            res.status(500).json({ error: "Failed to fetch invites" });
        }
    }
);

// ❌ Delete an invite — overseer only
router.delete(
    "/:id",
    authMiddleware,
    requireRole("platformAdmin"),
    async (req, res) => {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        try {
            await prisma.invite.delete({ where: { id } });
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: "Failed to delete invite" });
        }
    }
);

export default router;