import { prisma } from "../../lib/db";
import { logStepOutcome } from "../../utils/logStepOutcome";
import { normalizeConfig } from "../../utils/configHelper";

type BranchResult =
    | { status: "completed"; stepId: string; compensate: () => Promise<any> }
    | { status: "failed"; stepId: string; error: unknown };

type ParallelConfig = {
    parallelSteps: { id: string; compensate?: string }[];
};

async function runStepWithCompensation(
    instanceId: string,
    stepId: string,
    execute: () => Promise<any>,
    compensate: () => Promise<any>
): Promise<BranchResult> {
    try {
        await execute();
        return { status: "completed", stepId, compensate };
    } catch (err) {
        return { status: "failed", stepId, error: err };
    }
}

export async function executeParallelStep(
    instanceId: string,
    stepId: string,
    config: any,
    tenantId: string
) {
    const normalized = normalizeConfig<ParallelConfig>(config);

    const settled = await Promise.allSettled(
        normalized.parallelSteps.map(branch =>
            runStepWithCompensation(
                instanceId,
                branch.id,
                () =>
                    prisma.workflowInstance.update({
                        where: { id: instanceId },
                        data: { currentStepId: branch.id }
                    }),
                branch.compensate
                    ? () =>
                        logStepOutcome(
                            instanceId,
                            branch.id,
                            tenantId,
                            "PARALLEL",
                            "compensated",
                            `Compensation executed for ${branch.id}`
                        )
                    : async () => { }
            )
        )
    );

    const successes: BranchResult[] = [];
    const failures: BranchResult[] = [];

    for (let i = 0; i < normalized.parallelSteps.length; i++) {
        const branchId = normalized.parallelSteps[i].id;
        const result = settled[i];

        if (result.status === "fulfilled") {
            if (result.value.status === "completed") {
                successes.push(result.value);
                await logStepOutcome(
                    instanceId,
                    branchId,
                    tenantId,
                    "PARALLEL",
                    "completed",
                    `Branch ${branchId} executed successfully`
                );
            } else {
                failures.push(result.value);
                await logStepOutcome(
                    instanceId,
                    branchId,
                    tenantId,
                    "PARALLEL",
                    "failed",
                    `Branch ${branchId} failed: ${result.value.error}`
                );
            }
        } else {
            failures.push({ status: "failed", stepId: branchId, error: result.reason });
            await logStepOutcome(
                instanceId,
                branchId,
                tenantId,
                "PARALLEL",
                "failed",
                `Branch ${branchId} rejected: ${result.reason}`
            );
        }
    }

    if (failures.length > 0) {
        for (const s of successes) {
            if (s.status === "completed") {
                await s.compensate();
            }
        }
        await logStepOutcome(
            instanceId,
            stepId,
            tenantId,
            "PARALLEL",
            "failed",
            `Parallel step failed → ${failures.length} branch(es) errored, compensations applied`
        );
    } else {
        await logStepOutcome(
            instanceId,
            stepId,
            tenantId,
            "PARALLEL",
            "completed",
            `Parallel step completed successfully → ${normalized.parallelSteps.map(b => b.id).join(", ")}`
        );
    }
}