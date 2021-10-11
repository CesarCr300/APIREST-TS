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
interface IUser{
    "username":string,
    "password":string,
    "isAdmin":boolean,
    "id":string
}

let userData:IUser = {"username":"","password":"","isAdmin":false,"id":""}
let adminData:IUser = {"username":"","password":"","isAdmin":true,"id":""}
beforeAll(async() => {
    await connectDB()
})
beforeEach(async () =>{
    const responseUser = await request(app).post("/api/users").send({"username":"user","password":"user"})
    const responseAdmin = await request(app).post("/api/users").send({"username":"admin","password":"admin", "isAdmin":true})

    userData.id = responseUser.body._id
    userData.username = responseUser.body.username
    userData.password = responseUser.body.password
    userData.isAdmin = responseUser.body.isAdmin
    adminData.id= responseAdmin.body._id
    adminData.username= responseAdmin.body.username
    adminData.password= responseAdmin.body.password
    adminData.isAdmin = responseAdmin.body.isAdmin
})
afterEach(async () => {
    await User.deleteMany({})
})

afterAll(async () =>await closeDB())

describe("POST /api/users", () => {
    test("Create a new user", async () => {
        const responseUser = await request(app).post("/api/users").send({"username":"user1", "password":"user1"})

        expect(responseUser.status).toBe(200)

        expect(responseUser.body).toHaveProperty("username")
        expect(responseUser.body.username).toBe("user1")

        const listUsers = await User.find({})
        expect(listUsers.length).toBe(3)
        expect(listUsers[2]).toHaveProperty("username")
        expect(listUsers[2]).toHaveProperty("_id")
        expect(listUsers[2].username).toBe("user1")
        expect(listUsers[2].isAdmin).toBe(false)
    })
    test("Create a new admin", async()=>{
        const responseUser = await request(app).post("/api/users").send({"username":"admin1", "password":"admin1", "isAdmin": true})

        expect(responseUser.status).toBe(200)

        expect(responseUser.body).toHaveProperty("username")
        expect(responseUser.body.username).toBe("admin1")

        const listUsers = await User.find({})

        expect(listUsers.length).toBe(3)
        expect(listUsers[2]).toHaveProperty("username")
        expect(listUsers[2]).toHaveProperty("_id")
        expect(listUsers[2].username).toBe("admin1")
        expect(listUsers[2].isAdmin).toBe(true)
    })
})


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

describe("GET /api/users/idUser (PERMISSIONS ADMIN OR USER)", ()=>{
    test("GET an user by another user", async()=>{
        const anotherUserToken = await request(app).post("/api/users/login").send({username:"user", password:"user"})
        const token = anotherUserToken.body.token
        
        const responseUser = await request(app).get(`/api/users/${adminData.id}`).set("access-token", token)

        expect(responseUser.status).toBe(401)
        expect(responseUser.body.message).toBe("Access Denied")
    })
    test("GET an user from an admin", async()=>{
        const responseLoginAdmin = await request(app).post("/api/users/login").send({username: "admin", password:"admin"})
        const token = responseLoginAdmin.body.token

        const responseUser = await request(app).get(`/api/users/${userData.id}`).set("access-token",token)
        
        expect(responseUser.status).toBe(200)
        expect(responseUser.body).toHaveProperty("username")
        expect(responseUser.body).toHaveProperty("isAdmin")
        expect(responseUser.body.username).toBe("user")
        expect(responseUser.body.isAdmin).toBe(false)
    })
    test("GET an an user from the same user", async()=>{
        const responseLoginUser = await request(app).post("/api/users/login").send({username:"user", password:"user"})
        const token = responseLoginUser.body.token

        const responseUser = await request(app).get(`/api/users/${userData.id}`).set("access-token", token)

        expect(responseUser.status).toBe(200)
        expect(responseUser.body).toHaveProperty("username")
        expect(responseUser.body).toHaveProperty("isAdmin")
        expect(responseUser.body.username).toBe("user")
        expect(responseUser.body.isAdmin).toBe(false)
    })
})

describe("PATCH /api/users/idUser", ()=>{
    test("UPDATE a user by the same user", async ()=>{
        const responseLoginUser = await request(app).post(`/api/users/login`).send({username:"user", password:"user"})
        const token = responseLoginUser.body.token
        const responseUpdateUser = await request(app).patch(`/api/users/${userData.id}`).send({password:"newPassword"}).set("access-token", token)

        const updatedUser = await User.findById(userData.id)

        expect(responseUpdateUser.status).toBe(200)
        expect(responseUpdateUser.body.password).not.toBe(userData.password)
        expect(updatedUser!.validatePassword("newPassword")).resolves.toBe(true)
    })
})