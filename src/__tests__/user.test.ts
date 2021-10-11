import {app} from "../app"
import { User } from '../user/model'
import { connectDB, closeDB } from '../db'
import config from "../config"
import jwt from 'jsonwebtoken'
import request from "supertest"

interface IResponseJWT {
    "id":string,
    "iat":number
}

beforeAll(async() => {
    await connectDB()
})
beforeEach(async () =>{
    const responseUser = await request(app).post("/api/users").send({"username":"user","password":"user"})
    const responseAdmin = await request(app).post("/api/users").send({"username":"admin","password":"admin"})
})
afterEach(async () => {
    await User.deleteMany({})
})

afterAll(async () =>await closeDB())

describe("POST /api/login", ()=>{
    test("By a user with an incorrect username", async()=>{
        const response = await request(app).post("/api/users/login").send({username: "fail", password:"user"})
        expect(response.body).toHaveProperty("message")
        expect(response.body.message).toBe("Username or password is wrong")
    })
    test("By a user with an incorrect password", async()=>{
        const response = await request(app).post("/api/users/login").send({username: "user", password:"fail"})
        expect(response.body).toHaveProperty("message")
        expect(response.body.message).toBe("Username or password is wrong")
    })
    test("By a user with a correct password", async()=>{
        const response = await request(app).post("/api/users/login").send({username: "user", password:"user"})
        const token = response.body.token
        const responseJWT = jwt.verify(token, config.TOKEN_SECRET) as IResponseJWT
        const userId = responseJWT.id
        const userFounded = await User.findById(userId)

        expect(userFounded).toHaveProperty("username")
        expect(userFounded!.username).toBe("user")
        expect(response.header).toHaveProperty("access-token")
        expect(response.header["access-token"]).toBe(token)
    })
})

// describe("GET /api/users", () => {
//     test("Without a token", async () => {
//         const users = await request(app).get("/api/users")
//     })
//     test("with a token by a user", async()=>{
//         const response = await request(app).post("/login")
//     })
// })