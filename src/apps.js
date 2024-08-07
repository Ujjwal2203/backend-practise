import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()

// use is used for middleware 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// to handle json files directly from api 
app.use(express.json({limit: "16kb"}))

// to handle url formats for example "UJJWAL JAIN" when converted to url will be written as UJJWAL%20JAIN i.e "space" is replaced by "%20" and urlencoded is used for that purpose to handle those requests
app.use(express.urlencoded({extended: true , limit: "16kb"}))

// this is used to store public assests and "public" is written because there is a folder named public which can be used to store assests like images etc.
app.use(express.static("public"))

app.use(cookieParser())

// routes 

import userRouter from "./routes/user.routes.js"

// routes declaration 
// here we can't use app.get because there we are segregating everything and we need "use" method 

app.use("/api/v1/user", userRouter)

// http://localhost:8000/api/v1/user/register

export {app}