import mongoose , {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
  username: {
    type: String,
    unique : true,
    required: true,
    lowercase: true,
    trim: true,
    index: true  // this is basically used for enchancing the seaching capability of database
  },
  email: {
    type: String,
    unique : true,
    required: true,
    lowercase: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar:{
    type: String,  // cloudnary is used to store images and all and send url which is stored in avatar as a string
    required: true
  },
  coverImage:{
    type: String,  // cloudnary is used to store images and all and send url which is stored in avatar as a string
  },
  watchHistory : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  password: {
    type: String,  // although password should't be string type and should be stored in encrypted form
    required: [true , "password is required"]
  },
  refreshToken : {
    type: String
  }


},{timestamps:true})

// to deal with password problem we install and use bcrypt or bcrypt.js npm package to hash password and secure it.
// jsonwebtoken is also installed because of refreshtoken

// pre hook is also a middleware hook
// this will help encrypt the password
userSchema.pre("save", async function (next) {
  if(this.isModified("password")){
    this.password = bcrypt.hash(this.password , 10)
    next()
  }
})

// to check if password entered by user is correct or not we can define our own user defined method

userSchema.methods.ispasswordcorrect = async function(password){
    return await bcrypt.compare(password, this.password) // bcrypt can also compare and return true or false
 } 

userSchema.methods.generateaccesstoken = function(){
  return jwt.sign(
    {
      _id : this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generaterefreshtoken = function(){
  return jwt.sign(
    {
      _id : this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userSchema)