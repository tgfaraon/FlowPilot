import express from "express";
import { PrismaClient } from "@prisma/client";
import { advance } from "./engine/flowEngine";
import "./engine/schedulerRunner";

import approveManual from "./api/manualReview/approveManual";
import rejectManual from "./api/manualReview/rejectManual";
import getStatus from "./api/workflowStatus/getStatus";
import getLogs from "./api/workflowStatus/getLogs";
import cors from "cors";

import templateRoutes from "./routes/templateRoutes";
import workflowRoutes from "./routes/workflowRoutes";
import tenantRoutes from './routes/tenantRoutes';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import inviteRoutes from "./routes/inviteRoutes";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api", templateRoutes);
app.use("/api", workflowRoutes);
app.use('/api/tenants', tenantRoutes);
app.use("/api/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/invites", inviteRoutes);

app.post("/manual/:instanceId", async (req, res) => {
    const { instanceId } = req.params;
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) return res.status(404).json({ error: "Instance not found" });
    if (instance.status !== "waiting_manual")
        return res.status(400).json({ error: `Instance status is ${instance.status}, not waiting_manual` });

    await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { status: "running", manualPayload: req.body || null },
    });
    await advance(instanceId);
    res.json({ ok: true });
});

app.post("/workflow/:instanceId/manual/approve", approveManual);
app.post("/workflow/:instanceId/manual/reject", rejectManual);

app.get("/workflow/:instanceId/status", getStatus);
app.get("/workflow/:instanceId/logs", getLogs);

app.get("/workflows", async (req, res) => {
    try {
        const instances = await prisma.workflowInstance.findMany({
            include: {
                workflow: true,
                application: {
                    include: {
                        user: true, // <-- include the EndUser relation
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(
            instances.map((i) => ({
                id: i.id,
                status: i.status,
                createdAt: i.createdAt,
                workflowName: i.workflow.name,
                userEmail: i.application.user?.email ?? "N/A",
            }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch workflows" });
    }
});

app.get("/workflows/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch the workflow instance itself
        const instance = await prisma.workflowInstance.findUnique({ where: { id } });
        if (!instance) return res.status(404).json({ error: "Workflow not found" });

        // Fetch step executions for this instance
        const steps = await prisma.stepExecution.findMany({
            where: { instanceId: id },
        });

        // Fetch logs for this instance
        const logs = await prisma.workflowExecutionLog.findMany({
            where: { instanceId: id },
        });

        // Attach logs to each step manually
        const stepsWithLogs = steps.map((s) => ({
            id: s.id,
            stepId: s.stepId,
            status: s.status,
            createdAt: s.createdAt,
            logs: logs
                .filter((log) => log.stepId === s.id)
                .map((log) => ({
                    id: log.id,
                    stepId: log.stepId,
                    status: log.status,
                    message: log.message ?? "",
                    createdAt: log.createdAt,
                })),
        }));

        // Build response
        res.json({
            id: instance.id,
            status: instance.status,
            createdAt: instance.createdAt,
            steps: stepsWithLogs,
            logs: logs.map((log) => ({
                id: log.id,
                stepId: log.stepId,
                status: log.status,
                message: log.message ?? "",
                createdAt: log.createdAt,
            })),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch workflow detail" });
    }
});

app.listen(3001, () => {
    console.log("FlowPilot backend running on port 3001");
});