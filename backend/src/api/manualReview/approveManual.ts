import { Request, Response } from "express";
import { resumeManualStep } from "../../engine/steps/manualReview";

interface ManualParams {
    instanceId: string;
}

export default async function approveManual(req: Request<ManualParams>, res: Response) {
    const { instanceId } = req.params;

    try {
        await resumeManualStep(instanceId, true);
        return res.json({ ok: true });
    } catch (err: any) {
        console.error(`Error approving manual review for instance ${instanceId}:`, err);
        return res.status(500).json({ error: err.message });
    }
}