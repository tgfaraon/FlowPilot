import { Request, Response } from "express";
import { resumeManualStep } from "../../engine/steps/manualReview";

interface ManualParams {
    instanceId: string;
}

export default async function rejectManual(req: Request<ManualParams>, res: Response) {
    const { instanceId } = req.params;

    try {
        await resumeManualStep(instanceId, false);
        return res.json({ ok: true });
    } catch (err: any) {
        console.error(`Error rejecting manual review for instance ${instanceId}:`, err);
        return res.status(500).json({ error: err.message });
    }
}