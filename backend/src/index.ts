import "dotenv/config";
import express, { Router } from "express";
import cookieParser from "cookie-parser";
import db from "./db";
import jwt, { decode, sign, verify } from "jsonwebtoken"
import { User } from "./models";
import { compare, genSalt, hash } from "bcrypt"
import authMiddleware from "./middleware";

const app = express();

app.use(express.json())
app.use(cookieParser())

app.post("/login", async (req, res) => {

    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            "error": "Enter email and password correctly"
        })
    }
    const result = await db.query<User>("SELECT * FROM users WHERE email = $1", [email])
    if (!result.rowCount || result.rowCount <= 0) {
        return res.status(401).json({
            "error": "Email or Password is Invalid"
        })
    }
    const user = result.rows[0];
    if (!(await compare(password, user.password))) {
        return res.status(401).json({
            "error": "invalid credentials"
        });
    }
    const token = sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "HELLO");
    return res.cookie("token", token).status(200).json({ "message": "Logged in successfully" });
})

app.post("/signup", async (req, res) => {
    // console.log(process.env)
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            "error": "Enter email and password correctly"
        })
    }
    const result = await db.query<User>("SELECT * FROM users WHERE email = $1", [email])
    if (result.rowCount && result.rowCount >= 1) {
        return res.status(400).json({
            "error": "User Already Exists"
        })
    }
    const hashedPass = await hash(password, await genSalt(10))
    const query = "INSERT INTO users (email, password) VALUES ($1 , $2)"
    try {
        const r = await db.query(query, [email, hashedPass])
        if (r.rowCount && r.rowCount === 1) {
            return res.status(201).json({ "message": "Account Created Successfully" });
        } else {
            return res.status(500)
        }
    } catch (e) {
        console.log(e)
    }
})
const protectedRoutes = Router()
protectedRoutes.use(authMiddleware)
protectedRoutes.post("/create", async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        return res.status(400).json({
            "error": "Don't Leave title or decription blank"
        })
    }
    const id = (decode(req.cookies.token) as { id: number, email: string }).id
    try {
        const result = await db.query("INSERT INTO todos (title, description, user_id) VALUES ($1,$2,$3)", [title, description, id]);
        if (result.rowCount && result.rowCount === 1) {
            res.status(201).json({
                "message": "Todo Created Successfully"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
    }
})

protectedRoutes.delete("/delete", async (req, res) => {
    const { id } = req.body
    const user_id = (decode(req.cookies.token) as { id: number, email: string }).id

    try {
        const result = await db.query("DELETE FROM todos WHERE id = $1 AND user_id = $2", [id, user_id]);
        if (result.rowCount && result.rowCount === 1) {
            res.status(201).json({
                "message": "Todo Deleted Successfully"
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500)
    }
})

protectedRoutes.post("/edit",async (req, res) => {
    const { id, title, description } = req.body
    const user_id = (decode(req.cookies.token) as { id: number, email: string }).id
    try {
        const query = "UPDATE todos SET title = $1, description = $2,updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *"
        const result = await db.query(query, [title, description, id, user_id]);
        if(result.rowCount && result.rowCount === 0){
            return res.status(404).json({ error: "Todo not found for user" });
        }
        return res.status(200).json({
            "message":"todo updated successfully"
        })
    } catch (e) {
        console.log(e)
        return res.status(500)
    }
})

protectedRoutes.get("/all", async(req,res) => {
    const user_id = (decode(req.cookies.token) as { id: number, email: string }).id
    try{
        const result = await db.query("SELECT * FROM todos WHERE user_id = $1",[user_id]);
        if(result.rowCount && result.rowCount > 0){
            return res.status(200).json({
                "todos":result.rows
            })
        } else {
            return res.status(200).json({
                "message":"no todos were found"
            })
        }
    } catch(e){
        return res.status(500)
    }
})

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080

app.use("/todo", protectedRoutes)
app.listen(PORT, () => {
    console.log("Server started on http://localhost:" + PORT)
})