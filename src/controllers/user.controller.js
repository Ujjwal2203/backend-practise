import { asyncHandler } from "../utils/asynchandler.js";

// this is a basic controller which is gonna provide the response for user request
const registerduser = asyncHandler( async(req,res) => {
    res.status(200).json({
      message: "ok"
    })
} )

export {registerduser}