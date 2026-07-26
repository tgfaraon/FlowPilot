import { Request } from "express";

export interface UserPayload {
    id: string;
    email: string;
    role: string;
    tenantId?: string;
}

export interface RequestWithUser extends Request {
    user?: UserPayload;
}