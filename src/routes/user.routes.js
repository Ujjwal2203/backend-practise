import { Router } from "express";
import { loginUser, registerduser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

router.route("/login").post(loginUser)


//secured routes 
router.route("/logout").post( verifyJWT , logoutUser) 

export default router