import mongoose, { connect } from "mongoose"
import { DB_NAME } from "../constants.js"

// db is an another continent 

const connectdb = async () => {
  try {
    const connectInstance =  await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
    console.log(`mongodb connected || DB HOST : ${connectInstance.connection.host} `)
  } catch (error) {
    console.error("mongoDB connection failed ",error)
    // throw error
    process.exit(1)
  }
}

export default connectdb