import { PrismaClient } from "@prisma/client";
import { advance } from "../flowEngine";
import { evaluateRule } from "../../workflow/evaluators/rules";
import { logStepOutcome } from "../../utils/logStepOutcome";
import { normalizeConfig } from "../../utils/configHelper";

const prisma = new PrismaClient();

type ConditionalConfig = {
    rule: string;
    onTrue: string;
    onFalse: string;
};

export async function executeConditionalStep(instanceId: string, stepId: string, config: any) {
    const instance = await prisma.workflowInstance.findUnique({ where: { id: instanceId } });
    if (!instance) throw new Error("Instance not found");

    const normalized = normalizeConfig<ConditionalConfig>(config);
    const result = await evaluateRule(normalized.rule, instance);

    await logStepOutcome(
        instanceId,
        stepId,
        instance.tenantId ?? "default-tenant",
        "CONDITIONAL",
        "running",
        `Conditional step evaluated rule: ${normalized.rule} → ${result}`
    );

    const nextStepId = result ? normalized.onTrue : normalized.onFalse;

    await prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStepId: nextStepId }
    });

    await advance(instanceId);
}