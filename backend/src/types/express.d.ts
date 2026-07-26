import "express";

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            email: string;
            role: string;
            tenantId?: string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}