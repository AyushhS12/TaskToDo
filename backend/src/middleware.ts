import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import db from "./db";

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies["token"]as string
    if (!token) return res.status(401).json({ "error": "Login Please" });
    try {
        const decoded: { id: number, email: string } = verify(token, process.env.JWT_SECRET || "HELLO") as { id: number, email: string }
        const query = "SELECT * FROM users WHERE id = $1 AND email = $2"
        const result = await db.query(query, [decoded.id,decoded.email]);
        if (result.rowCount && result.rowCount == 1) {
            next()
        }
    } catch (e) {
        console.log(e)
        return res.status(401).json({ "error": "Login Please" });
    }
}