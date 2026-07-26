import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
}

// ✅ General auth middleware (still works for existing routes)
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

// ✅ Explicit alias for routes that expect `requireAuth`
export const requireAuth = authMiddleware;

// ✅ Role check for admin-only routes
export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== "platformAdmin") {
        return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
};