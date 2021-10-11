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
    const responseAdmin = await request(app).post("/api/users").send({"username":"admin","password":"admin", "isAdmin":true})
})
afterEach(async () => {
    await User.deleteMany({})
})

afterAll(async () =>await closeDB())

describe("POST /api/users/login", ()=>{
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

describe("GET /api/users", () => {
    test("By someone without a token", async () => {
        const responseUsers = await request(app).get("/api/users")
        expect(responseUsers.body).toHaveProperty("message")
        expect(responseUsers.body.message).toBe("You need a token")
        expect(responseUsers.status).toBe(401)
    })
    test("By someone with a wrong token", async () =>{
        const responseUsers = await request(app).get("/api/users").set("access-token", "token123")

        expect(responseUsers.status).toBe(401)
        expect(responseUsers.body).toHaveProperty("message")
        expect(responseUsers.body.message).toBe("jwt malformed")
    })
    test("By a user with its token", async()=>{
        const responseLogin = await request(app).post("/api/users/login").send({username:"user", password: "user"})
        const token = responseLogin.body.token

        const responseUsers = await request(app).get("/api/users").set("access-token", token)

        expect(responseUsers.status).toBe(401)
        expect(responseUsers.body).toHaveProperty("message")
        expect(responseUsers.body.message).toBe("You are not an admin")
    })
    test("By a admin with its token", async()=>{
        const responseAdmin = await request(app).post("/api/users/login").send({username:"admin", password:"admin"})
        const token = responseAdmin.body.token

        const responseUsers = await request(app).get("/api/users").set("access-token", token)
        expect(responseUsers.status).toBe(200)
        expect(responseUsers.body.length).toBe(2)
        expect(responseUsers.body[0]).toHaveProperty("_id")   
        expect(responseUsers.body[1]).toHaveProperty("_id")      
    })
})