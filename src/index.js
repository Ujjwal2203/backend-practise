// dotenv is imported as early as possible in main file because it provides environmental variables within it 

// 1st way to import it
// require("dotenv").config({path: "/.env"}) // but this brings inconsistency so 

//2nd way 

import dotenv from "dotenv"

// import mongoose from " mongoose"
// import {DB_NAME} from "./constants"
import connectdb from "./db/index.js"

dotenv.config({path : '/.env'})

connectdb()





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