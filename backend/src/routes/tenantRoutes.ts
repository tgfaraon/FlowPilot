import { Router } from "express";
import { prisma } from "../lib/db";
import crypto from "crypto";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany();
        res.json(tenants);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tenants" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.params.id },
            include: { admins: true },
        });

        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }

        res.json(tenant);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tenant" });
    }
});

router.post(
    "/",
    authMiddleware,
    requireRole("tenantAdmin"),
    async (req, res) => {
        const { name, domain } = req.body;
        try {
            const tenant = await prisma.tenant.create({ data: { name, domain } });
            res.json(tenant);
        } catch (err) {
            res.status(500).json({ error: "Failed to create tenant" });
        }
    }
);

router.post(
    "/invites",
    authMiddleware,
    requireRole("tenantAdmin"),
    async (req, res) => {
        const { tenantId, email, role } = req.body;
        try {
            const invite = await prisma.invite.create({
                data: {
                    tenantId,
                    email,
                    role: "tenantAdmin",
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

router.post(
    "/:id/assign-admin",
    authMiddleware,
    requireRole("platformAdmin"),
    async (req, res) => {
        const { id } = req.params;
        const { email } = req.body;

        try {
            const tenantId = Array.isArray(id) ? id[0] : id;

            const admin = await prisma.adminUser.create({
                data: {
                    email,
                    tenantId,
                    role: "tenantAdmin",
                    hashedPassword: "demo",
                },
            });

            res.json(admin);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to assign admin" });
        }
    }
);

router.post("/register/:token", async (req, res) => {
    const { token } = req.params;
    const { name, email, password } = req.body;
    try {
        const invite = await prisma.invite.findUnique({ where: { token } });
        if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
            return res.status(400).json({ error: "Invalid or expired invite" });
        }

        let user;
        if (invite.role === "tenantAdmin") {
            user = await prisma.adminUser.create({
                data: {
                    email,
                    name,
                    role: "tenantAdmin",
                    tenantId: invite.tenantId,
                    hashedPassword: password, // hash properly in production
                },
            });
        } else {
            user = await prisma.endUser.create({
                data: {
                    email,
                    name,
                    tenantId: invite.tenantId,
                    hashedPassword: password,
                },
            });
        }

        // Mark invite as used
        await prisma.invite.delete({ where: { id: invite.id } });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

export default router;