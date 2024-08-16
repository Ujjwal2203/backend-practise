import { Router } from "express";
import { loginUser, registerduser, logoutUser ,refreshAccessToken} from "../controllers/user.controller.js";
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


//secured routes   here verifyJWT is a middleware i.e before logout middleware will be executed 
router.route("/logout").post( verifyJWT , logoutUser) 
router.route("/refreshToken").post(refreshAccessToken)

export default router