import { User, IUser } from "./model"
import { Request, Response } from "express"
import jsonwebtoken from "jsonwebtoken"
import config from "../config"

export const createUser = async (req: Request, res: Response) => {
    try {
        let { username, password, isAdmin } = req.body;
        if (!isAdmin) isAdmin = false;
        const newUser: IUser = new User({ username, password, isAdmin });
        newUser.password = await newUser.createPassword(password)
        const savedUser = await newUser.save()
        const token: string = jsonwebtoken.sign({ id: savedUser._id }, config.TOKEN_SECRET || "secret")
        res.setHeader("access-token", token)
        res.json(savedUser)
    }
    catch (error) {
        res.status(400).send(error)
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const userFounded = await User.findOne({ username })
    if (!userFounded) return res.status(404).json({ message: "Username or password is wrong" })

    const isUser: boolean = await userFounded.validatePassword(password)
    if (!isUser) return res.status(401).json({ message: "Username or password is wrong" })

    const token: string = jsonwebtoken.sign({ id: userFounded._id }, config.TOKEN_SECRET || "secret")
    res.setHeader("access-token", token)
    res.json({ token })
}

export const getUser = async (req: Request, res: Response) => {
    const userFounded = await User.findById(req.params.idUser)
    return res.status(200).json(userFounded)
}

export const getUsers = async (req: Request, res: Response) => {
    const usersFounded = await User.find({})
    res.json(usersFounded)
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { password } = req.body
        const userFounded = await User.findById(req.params.idUser)

        if (!userFounded) return res.status(401).json({message: "The user does not exist"})
        console.log(password)
        userFounded.password = await userFounded.createPassword(password)
        await userFounded.save()
        res.json(userFounded)
    }
    catch (err: any) {
        console.log(err)
        res.status(401).json({ message: err.message })
    }
}

export const deleteUser = async(req:Request, res:Response)=>{
    await User.findByIdAndDelete(req.params.idUser)
    res.status(204).json({ message: "deleted"})
}