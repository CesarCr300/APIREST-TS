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
exports.verifyIsAdmin = exports.isUserOrIsAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const model_1 = require("../user/model");
function isUserOrIsAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.header("access-token");
            if (!token)
                return res.status(401).json({ message: "You need a token" });
            const infoToken = jsonwebtoken_1.default.verify(token, config_1.default.TOKEN_SECRET);
            if (!infoToken)
                return res.status(401).json({ message: "You need a valid token" });
            const userFounded = yield model_1.User.findById(infoToken.id);
            if (!userFounded)
                return res.status(401).json({ message: "The user does not exist" });
            if (userFounded.isAdmin || userFounded._id == req.params.idUser)
                return next();
            res.status(401).json({ message: "Access Denied" });
        }
        catch (err) {
            res.status(401).json({ message: err.message });
        }
    });
}
exports.isUserOrIsAdmin = isUserOrIsAdmin;
function verifyIsAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.header("access-token");
            if (!token)
                return res.status(401).json({ message: "You need a token" });
            const infoToken = jsonwebtoken_1.default.verify(token, config_1.default.TOKEN_SECRET);
            if (!infoToken)
                return res.status(401).json({ message: "You need a valid token" });
            const userFounded = yield model_1.User.findById(infoToken.id);
            if (!userFounded)
                return res.status(401).json({ message: "The user does not exist" });
            if (userFounded.isAdmin)
                return next();
            res.status(401).json({ message: "You are not an admin" });
        }
        catch (err) {
            res.status(401).json({ message: err.message });
        }
    });
}
exports.verifyIsAdmin = verifyIsAdmin;
