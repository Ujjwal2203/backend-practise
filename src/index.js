// dotenv is imported as early as possible in main file because it provides environmental variables within it 

// 1st way to import it
// require("dotenv").config({path: "/.env"}) // but this brings inconsistency so 

//2nd way 

import dotenv from "dotenv"

dotenv.config({path : '/.env'})
// import mongoose from " mongoose"
// import {DB_NAME} from "./constants"
import {app} from "./apps.js"
import connectdb from "./db/index.js"


connectdb()
.then(()=>{
  app.listen(process.env.PORT || 8000 , ()=>{
    console.log(`server is running at port ${process.env.PORT}`)
  })
  app.on("error",()=>{
    console.log("error is found in server",error)
  })
})
.catch((err)=>{
  console.log("MONGODB connection failed",err)
})





// 1st approach where both app and database are processed in a single file 
// import express from "express"
// const app = express()


// ( async ()=>{
//   try {
//     await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
//     app.on("error",(error)=>{
//       console.error("error",error)
//       throw error
//     })
//     app.listen(process.env.PORT,()=>{
//       console.log(`app is listening on the port ${process.env.PORT}`)
//     })
//   } 
  
//   catch (error) {
//     console.log("error",error)
//     throw error;
//   }
// })()