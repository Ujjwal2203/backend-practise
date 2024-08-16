import { Apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async(req,res,next) => {    // here res is not used so we can simply replace it with an underscore "_"
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")  // usually in authorization header using bearer schema context of header looks like ->  Authorization = Bearer <Token> so we are removing Bearer with empty string to get token
      if (!token) {
      throw new Apierror(401 , "authorization failed or unauthorized access ")
    }
  
    // using jwt method verify to check for token
    const decodedToken =   jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user) {
      throw new Apierror(401,"Invalid access tokem")
    }
    req.user = user 
    next()
  } catch (error) {
      throw new Apierror(401, error?.message || "invalid Access Token")
  }
})