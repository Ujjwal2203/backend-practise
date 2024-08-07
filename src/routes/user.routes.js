import { Router } from "express";
import { registerduser } from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(registerduser)



export default router