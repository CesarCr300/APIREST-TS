import { Router } from "express"
import {createUser, getUsers, loginUser, getUser, updateUser, deleteUser } from "./controllers"
import {verifyIsAdmin, isUserOrIsAdmin} from "../middlewares"

const router = Router()


router.route("/")
    .get(verifyIsAdmin,getUsers)
    .post(createUser)

router.post("/login", loginUser)

router.route("/:idUser")
    .get(isUserOrIsAdmin, getUser)
    .patch(isUserOrIsAdmin, updateUser)
    .delete(isUserOrIsAdmin, deleteUser)

export default router