import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import config from "../config"
import { User } from "../user/model"

interface IToken {
    "id": string,
    "iat": number
}

export async function isUserOrIsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.header("access-token")
        if (!token) return res.status(401).json({ message: "You need a token" })
        const infoToken = jwt.verify(token, config.TOKEN_SECRET) as IToken
        if (!infoToken) return res.status(401).json({ message: "You need a valid token" })
        const userFounded = await User.findById(infoToken.id)
        if (!userFounded) return res.status(401).json({ message: "The user does not exist" })
        if (userFounded.isAdmin || userFounded._id == req.params.idUser) return next()
        res.status(401).json({ message: "Access Denied" })
    } catch (err: any) {
        res.status(401).json({ message: err.message })
    }
}

export async function verifyIsAdmin(req: Request, res: Response, next: NextFunction){
    try {
        const token = req.header("access-token")
        if (!token) return res.status(401).json({ message: "You need a token" })
        const infoToken = jwt.verify(token, config.TOKEN_SECRET) as IToken
        if (!infoToken) return res.status(401).json({ message: "You need a valid token" })
        const userFounded = await User.findById(infoToken.id)
        if (!userFounded) return res.status(401).json({ message: "The user does not exist" })

        if (userFounded.isAdmin) return next()

        res.status(401).json({ message:"You are not an admin"})
    } catch (err:any) {
        res.status(401).json({ message: err.message})
    }
}
