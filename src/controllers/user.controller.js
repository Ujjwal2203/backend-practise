import { asyncHandler } from "../utils/asynchandler.js";
import {Apierror} from "../utils/apierror.js"
import { User} from "../models/user.model.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"
import {Apiresponse} from "../utils/apiresponse.js"
// this is a basic controller which is gonna provide the response for user request
const registerduser = asyncHandler( async(req,res) => {
    // step1 get user details from frontend (postman etc)
    // step 2 validation ( it may include not empty fields and all)
    // step 3 check if user already exists : username , email
    // check for images
    // check for avatar (compulsary or required)
    // upload them to cloudinary 
    // create user object - create entry in db
    // remove password and refresh token field from response 
    // check for user creation (not null)
    // return response


    // get user data  // if data is coming from forms or json 
    const {username , email, fullname, password} = req.body
    console.log("email: " , email);

    // validation check if its null

    // indiviually making all if condition is also ok but very time consuming
    // if (fullname === "") {
    //   throw new Apierror(400, "fullname is required")
    // }

    // alternative method

    if ([fullname,email,username,password].some((fields)=> fields?.trim()=== "")) {
         throw new Apierror(400 , "All fields are required")
    }

    //checking if user already exists 
    const existedUser = User.findOne({
      $or : [{username},{email}]  // we can use operations like and  , or, not etc by using "$"  here this will check if username or email already exists or not
    })
    if(existedUser){
      throw new Apierror(409, "user with email or username already exists")
    }

    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(req.files) 
    const coverimagelocalpath = req.files?.coverimage[0]?.path;

    if (!avatarLocalPath) {
      throw new Apierror(400, "avatar file is compulsory")
    }

    // upload on cloudinary
    const avatar = await uploadoncloudinary(avatarLocalPath)
    const coverimage = await uploadoncloudinary(coverimagelocalpath)

    // recheck if avatar is uploaded 
    if (!avatar) {
      throw new Apierror(400, "avatar file is compulsory")
    }

    // create user object 
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverimage: coverimage?.url || "",
      email,
      password,
      username: username.toLowerCase()
    })

    // check for user creation (not null) 
      // also remove password and refresh token by using select 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    
    if(!createdUser){
      throw new Apierror(500,"server error user not registered ")
    }
    // return response 
    return res.status(201).json(
      new Apiresponse(200 , createdUser ,"user successfully registered")
    )
} )

export {registerduser}