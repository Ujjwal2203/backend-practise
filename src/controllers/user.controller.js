import { asyncHandler } from "../utils/asynchandler.js";
import {Apierror} from "../utils/apierror.js"
import { User} from "../models/user.model.js"
import {uploadoncloudinary} from "../utils/cloudinary.js"
import {Apiresponse} from "../utils/apiresponse.js"
import jwt from "jsonwebtoken";

// creating a model for refresh  and access tokens 

const generateRefreshAndAccessTokens = async(userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken  = user.generateaccesstoken()
    const refreshToken = user.generaterefreshtoken()
    user.refreshToken = refreshToken
    await user.save({ValidateBeforeSave : false})

    return {accessToken , refreshToken}

  } catch (error) {
    throw new Apierror(500 , "generation of refersh and access token failed ")
  }

}


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
    const existedUser = await User.findOne({
      $or : [{username},{email}]  // we can use operations like and  , or, not etc by using "$"  here this will check if username or email already exists or not
    })
    if(existedUser){
      throw new Apierror(409, "user with email or username already exists")
    }
    // console.log(req.body)
    // console.log(req.files)
    // check for images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(req.files) 

    // in case coverimage is undefined we can apply classic check 
    // const coverimagelocalpath = req.files?.coverimage[0]?.path;
    let coverimagelocalpath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0 ) { 
      coverimagelocalpath = req.files.coverimage[0].path
    }


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
      coverImage: coverimage?.url || "",
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


const loginUser = asyncHandler(async(req,res)=>{
  // todos 
  // req.body -> data
  // username or email 
  // find user 
  // password check
  // regenrate access and refresh token
  // send cookies(refresh token and access token)

  const {username , password , email } = req.body
  if(!(email||username)){
    throw new Apierror(400 , "email or username is required")
  }

  const user = await User.findOne({
    $or: [{username} , {email}]
  })

  if (!user) {
    throw new Apierror(404 , " user not found please register ")
  }

  const isPasswordValid =  await user.ispasswordcorrect(password)
  if (!isPasswordValid)  {
    throw new Apierror(401, "password is incorrect try again!!")
  }

  const {refreshToken, accessToken } = await generateRefreshAndAccessTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // cookie 
  const options = {
    httpOnly: true,  // these options allows modification in cookies on server only and not on frontend so increases security
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken , options)
  .cookie("refreshToken", refreshToken , options)
  .json(
    new Apiresponse(
      // status code 
      200,
      // data
      {
        user: loggedInUser , refreshToken, accessToken
    },
    // message
    "user logged in successfully"
  )
  )

})

const logoutUser = asyncHandler(async(req,res)=>{
  // remove cookie
  // remove refresh token or refresh it 
  await  User.findByIdAndUpdate(  // findByIdAndUpdate is also a method of mongodb 
    // we added user object in auth middleware so we can access it and use just like req.body and req.cookies 
    req.user._id,
    { // another operator of mongodb set which is used to update values
      $set : {
        refreshToken: undefined
      }
    },
    {
      new: true // this will return the new value i.e will return the updated value without refreshToken 
    }
  )
  const options = {
    httpOnly: true,  // these options allows modification in cookies on server only and not on frontend so increases security
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken" , options)
  .clearCookie("refreshToken" , options)
  .json(new Apiresponse(200 ,{} ,"User logged out successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  // we are making this to refresh the access token after its expiry so user don't have to relogin 
  // we can do this by checking refresh token from cookies with the saved refresh token from database and if match we can generate a new access token

  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new Apierror(401 , "unauthorized request ")
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken ,
      process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new Apierror(408, "Invalid refresh Token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new Apierror(408, "refresh Token expired")
    }
  
    // after all the checks generate user a new token 
  
    const {accessToken  , newRefreshToken} = await generateRefreshAndAccessTokens(user._id)
  
    // we will send response in cookie so options is needed we can also declare them globally
    const options = {
      httponly: true,
      secure: true
    }
    return res
    .status(200)
    .cookie("refreshToken" , newRefreshToken , options)
    .cookie("accessToken" , accessToken , options)
    .json(
      new Apiresponse(
        200,
        {accessToken , refreshToken: newRefreshToken},
        "access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new Apierror(401 , "access token generation failed")
  }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword , newPassword} = req.body
  const user = await User.findById(req.user._id)
  const isPasswordCorrect  =  await user.ispasswordcorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new Apierror(400, "invalid old password")
  }
  user.password = newPassword
  await user.save({ValidateBeforeSave: false})

  return res
  .status(200)
  .json(new Apiresponse(200,{}, "Password changed successfull"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
 return res
 .status(200)
 .json(200,req.user,"current user fetched successfully")
})

// if we want to update files and all make another controller 
const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname , email } = req.body
  if(!(fullname||email)){
    throw new Apierror(400, "fullname or email is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullname,
        email   // it could be written as email:email
      } 
    },
    {new:true}
    
  ).select("-password")
  return res
  .status(200)
  .json(new Apiresponse(200 , user , "account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath){
    throw new Apierror(400,"Avatar file is missing")
  }
  const avatar =  await uploadoncloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new Apierror(400,"failed to upload on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new Apiresponse(200 , user , "User avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath){
    throw new Apierror(400,"coverImage file is missing")
  }
  const coverImage =  await uploadoncloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new Apierror(400,"failed to upload on cloudinary")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new Apiresponse(200 , user , "User coverImage updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params
  if(!username?.trim()){
    throw new Apierror(400, "username is missing")
  }
  const channel = await User.aggregate([
    {
      $match:{
        username : username?.toLowerCase()  // match is basically used at the starting to seprate required data from whole datasets
      }
    },
      {
        $lookup:{
            from: "subcriptions",
            localField: "_id",
            foreignField:"channel",
            as:"subscribers"
        }
      },
      {
        $lookup:{   // lookup is basically used for searching and joining datasets 
          from:"subscriptions",
          localField:"_id",
          foreignField:"subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields:{    // addfields is used to add additional fields to the data 
          subscribersCount: {   // this will calculate the number of subscribers a channel has
            $size: "$subscribers"
          },
          channelSubscribedTo:{  // this will calculate channel subscribed by our channel 
            $size: "$subscribedTo"
          },
          isSubscribed:{
            $cond:{   // cond stands for condition and it consists of if, then , else
              if: {
                $in: [req.user?._id , "$subscribers.subscriber"]  // in is used to check if data exists or not and can be used in arrays , object 
              },
              then: true,  // through this we are returning true and false to frontend and if true it will show that u are subscribed to the channel and if false then it will show subscribe button instead of subscribed as shown on youtube website 
              else: false,
            }
          }
        }
      },
      {
        $project:{   // project means projection i.e which fields we want to show we turn there flag to 1 and display them
          fullname: 1,
          username: 1,
          subscribersCount:1,
          channelSubscribedTo:1,
          isSubscribed:1,
          avatar:1,
          email:1
        }
      }
    
  ])

  if(!channel?.length){
    throw new Apierror(400, "channel does not exist")
  }

  return res
  .status(200)
  .json(
    new Apiresponse(200,channel[0], "User channel fetched successfully")
  )
})

export {registerduser , loginUser , logoutUser ,refreshAccessToken ,changeCurrentPassword  , getCurrentUser ,updateAccountDetails , updateUserAvatar ,updateUserCoverImage ,getUserChannelProfile}