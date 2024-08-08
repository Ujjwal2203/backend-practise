import { Router } from "express";
import { registerduser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router()

router.route("/register").post(
  upload.fields([{
    name: "avatar",
    maxCount: 1
  },
  {
    name: "coverimage",
    maxCount: 1
  }
]),
  registerduser
)



export default router