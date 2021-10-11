"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("./controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.route("/")
    .get(middlewares_1.verifyIsAdmin, controllers_1.getUsers)
    .post(controllers_1.createUser);
router.post("/login", controllers_1.loginUser);
router.route("/:idUser")
    .get(middlewares_1.isUserOrIsAdmin, controllers_1.getUser)
    .patch(middlewares_1.isUserOrIsAdmin, controllers_1.updateUser)
    .delete(middlewares_1.isUserOrIsAdmin, controllers_1.deleteUser);
exports.default = router;
