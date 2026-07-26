import "express";

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            tenantId: string;
            role: string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}