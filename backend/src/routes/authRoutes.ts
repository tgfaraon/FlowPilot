import { Router } from "express";
import { prisma } from "../lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

// 🔑 Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Try AdminUser first
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (admin && admin.hashedPassword) {
            const valid = await bcrypt.compare(password, admin.hashedPassword);
            if (!valid) return res.status(401).json({ error: "Invalid credentials" });

            // ✅ Normalize role: map "admin" → "tenantAdmin"
            const role = admin.role === "admin" ? "tenantAdmin" : admin.role;

            const token = jwt.sign(
                {
                    id: admin.id,
                    email: admin.email,
                    role,
                    tenantId: admin.tenantId ?? null,
                },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );
            return res.json({ token });
        }

        // Then try EndUser
        const endUser = await prisma.endUser.findUnique({ where: { email } });
        if (endUser && endUser.hashedPassword) {
            const valid = await bcrypt.compare(password, endUser.hashedPassword);
            if (!valid) return res.status(401).json({ error: "Invalid credentials" });

            const token = jwt.sign(
                {
                    id: endUser.id,
                    email: endUser.email,
                    role: "user",
                    tenantId: endUser.tenantId ?? null,
                },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );
            return res.json({ token });
        }

        return res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// 📝 Register via invite
router.post("/register/:token", async (req, res) => {
    const { token } = req.params;
    const { name, email, password } = req.body;

    try {
        const invite = await prisma.invite.findUnique({ where: { token } });
        if (!invite) return res.status(404).json({ error: "Invite not found" });

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invite expired" });
        }

        const hashed = await bcrypt.hash(password, 10);

        if (invite.role === "endUser") {
            await prisma.endUser.create({
                data: {
                    name,
                    email,
                    tenantId: invite.tenantId,
                    hashedPassword: hashed,
                },
            });
        } else if (invite.role === "admin") {
            // ✅ Normalize role here too
            await prisma.adminUser.create({
                data: {
                    name,
                    email,
                    role: "tenantAdmin",
                    tenantId: invite.tenantId,
                    hashedPassword: hashed,
                },
            });
        }

        await prisma.invite.delete({ where: { token } });

        res.json({ message: "Registration successful" });
    } catch (err) {
        console.error("Error during invite registration:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;