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
exports.deleteUser = exports.updateUser = exports.getUsers = exports.getUser = exports.loginUser = exports.createUser = void 0;
const model_1 = require("./model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { username, password, isAdmin } = req.body;
        if (!isAdmin)
            isAdmin = false;
        const newUser = new model_1.User({ username, password, isAdmin });
        newUser.password = yield newUser.createPassword(password);
        const savedUser = yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: savedUser._id }, config_1.default.TOKEN_SECRET || "secret");
        res.setHeader("access-token", token);
        res.json(savedUser);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.createUser = createUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const userFounded = yield model_1.User.findOne({ username });
    if (!userFounded)
        return res.status(404).json({ message: "Username or password is wrong" });
    const isUser = yield userFounded.validatePassword(password);
    if (!isUser)
        return res.status(401).json({ message: "Username or password is wrong" });
    const token = jsonwebtoken_1.default.sign({ id: userFounded._id }, config_1.default.TOKEN_SECRET || "secret");
    res.setHeader("access-token", token);
    res.json({ token });
});
exports.loginUser = loginUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userFounded = yield model_1.User.findById(req.params.idUser);
    return res.status(200).json(userFounded);
});
exports.getUser = getUser;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersFounded = yield model_1.User.find({});
    res.json(usersFounded);
});
exports.getUsers = getUsers;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password } = req.body;
        const userFounded = yield model_1.User.findById(req.params.idUser);
        if (!userFounded)
            return res.status(401).json({ message: "The user does not exist" });
        console.log(password);
        userFounded.password = yield userFounded.createPassword(password);
        yield userFounded.save();
        res.status(200).json(userFounded);
    }
    catch (err) {
        console.log(err);
        res.status(401).json({ message: err.message });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield model_1.User.findByIdAndDelete(req.params.idUser);
    res.status(204).json({ message: "deleted" });
});
exports.deleteUser = deleteUser;
