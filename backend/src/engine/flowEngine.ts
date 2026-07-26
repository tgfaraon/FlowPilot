import { PrismaClient, WorkflowInstance, WorkflowStep, StepType } from "@prisma/client";
import { executeParallelStep } from "./steps/parallelStep";
import { JsonObject } from "@prisma/client/runtime/library";
import { logStepOutcome } from "../utils/logStepOutcome";
import { normalizeConfig } from "../utils/configHelper";

const prisma = new PrismaClient();

type ActionConfig = {
    action: "http_request" | "update_application" | "log" | "custom";
    url?: string;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
    field?: string;
    value?: any;
};

type BranchConfig = {
    field: string;
    equals?: any;
    notEquals?: any;
    trueNext?: string;
    falseNext?: string;
};

type WaitConfig = {
    delayMs?: number;
    resumeAt?: string;
};

async function executeTrigger(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    return moveToNextStep(instance, step);
}

export async function executeAction(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = normalizeConfig<ActionConfig>(step.config);
    if (!config) return moveToNextStep(instance, step);

    await logStepOutcome(instance.id, step.id, instance.tenantId ?? "default-tenant", "ACTION", "running", `ACTION step started: ${config.action}`);

    switch (config.action) {
        case "http_request":
            return handleHttpRequest(instance, step, config);
        case "update_application":
            return handleApplicationUpdate(instance, step, config);
        case "log":
            console.log(config.body);
            await logStepOutcome(instance.id, step.id, instance.tenantId ?? "default-tenant", "ACTION", "completed", `ACTION log: ${JSON.stringify(config.body)}`);
            return moveToNextStep(instance, step);
        case "custom":
        default:
            await logStepOutcome(instance.id, step.id, instance.tenantId ?? "default-tenant", "ACTION", "completed", "ACTION custom executed");
            return moveToNextStep(instance, step);
    }
}

async function executeCondition(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    return moveToNextStep(instance, step);
}

async function executeBranch(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = normalizeConfig<BranchConfig>(step.config);
    if (!config) return moveToNextStep(instance, step);

    const app = await prisma.application.findUnique({ where: { id: instance.applicationId } });
    if (!app) return moveToNextStep(instance, step);

    const value = (app as any)[config.field];
    let nextStepId: string | null = null;

    if (config.equals !== undefined) {
        nextStepId = value === config.equals ? config.trueNext ?? null : config.falseNext ?? null;
    } else if (config.notEquals !== undefined) {
        nextStepId = value !== config.notEquals ? config.trueNext ?? null : config.falseNext ?? null;
    }

    if (!nextStepId) return moveToNextStep(instance, step);

    await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { currentStepId: nextStepId }
    });

    await advance(instance.id);
}

async function executeLoop(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    return moveToNextStep(instance, step);
}

export async function executeWait(instanceId: string, stepId: string, config?: WaitConfig) {
    const normalized = normalizeConfig<WaitConfig>(config);
    const delayMs = normalized.delayMs ?? 3000;

    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) throw new Error("Instance not found");

    await logStepOutcome(
        instanceId,
        stepId,
        instance.tenantId ?? "default-tenant",
        "WAIT",
        "running",
        `WAIT step raw config: ${JSON.stringify({ delayMs })}`
    );

    await new Promise(resolve => setTimeout(resolve, delayMs));

    await logStepOutcome(
        instanceId,
        stepId,
        instance.tenantId ?? "default-tenant",
        "WAIT",
        "completed",
        "WAIT finished, advancing"
    );

    const step = await prisma.workflowStep.findUnique({ where: { id: stepId } });
    if (!step) throw new Error("Step not found");

    return moveToNextStep(instance, step);
}

async function executeWebhook(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    return moveToNextStep(instance, step);
}

export async function executeManual(instance: WorkflowInstance, step: WorkflowStep) {
    await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { status: "waiting_manual" }
    });

    console.log(`Workflow paused for manual action on step ${step.id}`);

    if (step.nextStepId) {
        await prisma.workflowInstance.update({
            where: { id: instance.id },
            data: { currentStepId: step.nextStepId }
        });
    }
}

async function executeSystem(instance: WorkflowInstance, step: WorkflowStep) {
    return moveToNextStep(instance, step);
}

async function handleHttpRequest(instance: WorkflowInstance, step: WorkflowStep, config: ActionConfig): Promise<void> {
    if (!config.url) return moveToNextStep(instance, step);

    const response = await fetch(config.url, {
        method: config.method || "POST",
        headers: config.headers || {},
        body: config.body ? JSON.stringify(config.body) : undefined,
    });

    const result = await response.json().catch(() => null);

    await logStepOutcome(instance.id, step.id, instance.tenantId ?? "default-tenant", "ACTION", "completed", `ACTION http_request success: ${JSON.stringify(result)}`);

    return moveToNextStep(instance, step);
}

async function handleApplicationUpdate(instance: WorkflowInstance, step: WorkflowStep, config: ActionConfig): Promise<void> {
    if (!config.field) return moveToNextStep(instance, step);

    await prisma.application.update({
        where: { id: instance.applicationId },
        data: { [config.field]: config.value },
    });

    await logStepOutcome(instance.id, step.id, instance.tenantId ?? "default-tenant", "ACTION", "completed", `ACTION update_application: set ${config.field}=${config.value}`);

    return moveToNextStep(instance, step);
}

async function moveToNextStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    if (!step.nextStepId) {
        console.log("Workflow completed");
        await prisma.workflowInstance.update({
            where: { id: instance.id },
            data: { status: "completed" }
        });
        return;
    }

    await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { currentStepId: step.nextStepId }
    });

    return advance(instance.id);
}

export async function advance(instanceId: string) {
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance || !instance.currentStepId) throw new Error("WorkflowInstance missing required data");

    const step = await prisma.workflowStep.findUnique({ where: { id: instance.currentStepId } });
    if (!step) throw new Error("Step not found");

    switch (step.type) {
        case StepType.TRIGGER: return executeTrigger(instance, step);
        case StepType.ACTION: return executeAction(instance, step);
        case StepType.CONDITION: return executeCondition(instance, step);
        case StepType.BRANCH: return executeBranch(instance, step);
        case StepType.LOOP: return executeLoop(instance, step);
        case StepType.WAIT: return executeWait(instance.id, step.id);
        case StepType.WEBHOOK: return executeWebhook(instance, step);
        case StepType.MANUAL: return executeManual(instance, step);
        case StepType.SYSTEM: return executeSystem(instance, step);
        case StepType.PARALLEL:
            if (step.config && typeof step.config === "object" && "parallelSteps" in step.config) {
                const raw = (step.config as JsonObject)["parallelSteps"];
                const parallelConfig: { id: string; compensate?: string }[] = Array.isArray(raw)
                    ? raw.map((s: any) => typeof s === "string" ? { id: s } : { id: s.id, compensate: s.compensate })
                    : [];
                return executeParallelStep(instance.id, step.id, { parallelSteps: parallelConfig }, instance.tenantId ?? "default-tenant");
            } else {
                throw new Error(`Parallel step missing config.parallelSteps`);
            }
        default: throw new Error(`Unknown step type: ${step.type}`);
    }
}