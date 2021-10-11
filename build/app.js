"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
const morgan_1 = __importDefault(require("morgan"));
if (process.env.NODE_ENV !== "test") {
    app.use((0, morgan_1.default)('dev'));
}
//routes
const routes_1 = __importDefault(require("./user/routes"));
app.set("port", process.env.PORT || 3000);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use("/api/users", routes_1.default);
