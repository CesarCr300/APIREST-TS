"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../app");
const model_1 = require("../user/model");
const db_1 = require("../db");
const config_1 = __importDefault(require("../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
let userData = { "username": "", "password": "", "isAdmin": false, "id": "" };
let adminData = { "username": "", "password": "", "isAdmin": true, "id": "" };
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const responseUser = yield (0, supertest_1.default)(app_1.app).post("/api/users").send({ "username": "user", "password": "user" });
    const responseAdmin = yield (0, supertest_1.default)(app_1.app).post("/api/users").send({ "username": "admin", "password": "admin", "isAdmin": true });
    userData.id = responseUser.body._id;
    userData.username = responseUser.body.username;
    userData.password = responseUser.body.password;
    userData.isAdmin = responseUser.body.isAdmin;
    adminData.id = responseAdmin.body._id;
    adminData.username = responseAdmin.body.username;
    adminData.password = responseAdmin.body.password;
    adminData.isAdmin = responseAdmin.body.isAdmin;
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.User.deleteMany({});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield (0, db_1.closeDB)(); }));
describe("POST /api/users", () => {
    test("Create a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseUser = yield (0, supertest_1.default)(app_1.app).post("/api/users").send({ "username": "user1", "password": "user1" });
        expect(responseUser.status).toBe(200);
        expect(responseUser.body).toHaveProperty("username");
        expect(responseUser.body.username).toBe("user1");
        const listUsers = yield model_1.User.find({});
        expect(listUsers.length).toBe(3);
        expect(listUsers[2]).toHaveProperty("username");
        expect(listUsers[2]).toHaveProperty("_id");
        expect(listUsers[2].username).toBe("user1");
        expect(listUsers[2].isAdmin).toBe(false);
    }));
    test("Create a new admin", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseUser = yield (0, supertest_1.default)(app_1.app).post("/api/users").send({ "username": "admin1", "password": "admin1", "isAdmin": true });
        expect(responseUser.status).toBe(200);
        expect(responseUser.body).toHaveProperty("username");
        expect(responseUser.body.username).toBe("admin1");
        const listUsers = yield model_1.User.find({});
        expect(listUsers.length).toBe(3);
        expect(listUsers[2]).toHaveProperty("username");
        expect(listUsers[2]).toHaveProperty("_id");
        expect(listUsers[2].username).toBe("admin1");
        expect(listUsers[2].isAdmin).toBe(true);
    }));
});
describe("POST /api/users/login", () => {
    test("By a user with an incorrect username", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "fail", password: "user" });
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Username or password is wrong");
    }));
    test("By a user with an incorrect password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "user", password: "fail" });
        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toBe("Username or password is wrong");
    }));
    test("By a user with a correct password", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "user", password: "user" });
        const token = response.body.token;
        const responseJWT = jsonwebtoken_1.default.verify(token, config_1.default.TOKEN_SECRET);
        const userId = responseJWT.id;
        const userFounded = yield model_1.User.findById(userId);
        expect(userFounded).toHaveProperty("username");
        expect(userFounded.username).toBe("user");
        expect(response.header).toHaveProperty("access-token");
        expect(response.header["access-token"]).toBe(token);
    }));
});
describe("GET /api/users", () => {
    test("By someone without a token", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseUsers = yield (0, supertest_1.default)(app_1.app).get("/api/users");
        expect(responseUsers.body).toHaveProperty("message");
        expect(responseUsers.body.message).toBe("You need a token");
        expect(responseUsers.status).toBe(401);
    }));
    test("By someone with a wrong token", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseUsers = yield (0, supertest_1.default)(app_1.app).get("/api/users").set("access-token", "token123");
        expect(responseUsers.status).toBe(401);
        expect(responseUsers.body).toHaveProperty("message");
        expect(responseUsers.body.message).toBe("jwt malformed");
    }));
    test("By a user with its token", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseLogin = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "user", password: "user" });
        const token = responseLogin.body.token;
        const responseUsers = yield (0, supertest_1.default)(app_1.app).get("/api/users").set("access-token", token);
        expect(responseUsers.status).toBe(401);
        expect(responseUsers.body).toHaveProperty("message");
        expect(responseUsers.body.message).toBe("You are not an admin");
    }));
    test("By a admin with its token", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseAdmin = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "admin", password: "admin" });
        const token = responseAdmin.body.token;
        const responseUsers = yield (0, supertest_1.default)(app_1.app).get("/api/users").set("access-token", token);
        expect(responseUsers.status).toBe(200);
        expect(responseUsers.body.length).toBe(2);
        expect(responseUsers.body[0]).toHaveProperty("_id");
        expect(responseUsers.body[1]).toHaveProperty("_id");
    }));
});
describe("GET /api/users/idUser (PERMISSIONS ADMIN OR USER)", () => {
    test("GET an user by another user", () => __awaiter(void 0, void 0, void 0, function* () {
        const anotherUserToken = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "user", password: "user" });
        const token = anotherUserToken.body.token;
        const responseUser = yield (0, supertest_1.default)(app_1.app).get(`/api/users/${adminData.id}`).set("access-token", token);
        expect(responseUser.status).toBe(401);
        expect(responseUser.body.message).toBe("Access Denied");
    }));
    test("GET an user from an admin", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseLoginAdmin = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "admin", password: "admin" });
        const token = responseLoginAdmin.body.token;
        const responseUser = yield (0, supertest_1.default)(app_1.app).get(`/api/users/${userData.id}`).set("access-token", token);
        expect(responseUser.status).toBe(200);
        expect(responseUser.body).toHaveProperty("username");
        expect(responseUser.body).toHaveProperty("isAdmin");
        expect(responseUser.body.username).toBe("user");
        expect(responseUser.body.isAdmin).toBe(false);
    }));
    test("GET an an user from the same user", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseLoginUser = yield (0, supertest_1.default)(app_1.app).post("/api/users/login").send({ username: "user", password: "user" });
        const token = responseLoginUser.body.token;
        const responseUser = yield (0, supertest_1.default)(app_1.app).get(`/api/users/${userData.id}`).set("access-token", token);
        expect(responseUser.status).toBe(200);
        expect(responseUser.body).toHaveProperty("username");
        expect(responseUser.body).toHaveProperty("isAdmin");
        expect(responseUser.body.username).toBe("user");
        expect(responseUser.body.isAdmin).toBe(false);
    }));
});
describe("PATCH /api/users/idUser", () => {
    test("UPDATE a user by the same user", () => __awaiter(void 0, void 0, void 0, function* () {
        const responseLoginUser = yield (0, supertest_1.default)(app_1.app).post(`/api/users/login`).send({ username: "user", password: "user" });
        const token = responseLoginUser.body.token;
        const responseUpdateUser = yield (0, supertest_1.default)(app_1.app).patch(`/api/users/${userData.id}`).send({ password: "newPassword" }).set("access-token", token);
        const updatedUser = yield model_1.User.findById(userData.id);
        expect(responseUpdateUser.status).toBe(200);
        expect(responseUpdateUser.body.password).not.toBe(userData.password);
        expect(updatedUser.validatePassword("newPassword")).resolves.toBe(true);
    }));
});
