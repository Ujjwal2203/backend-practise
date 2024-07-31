// we can either use promise or try catch 

// using promises

const asyncHandler = (func) => { 
  (req,res,next)=>{
    Promise.resolve(func(req,res,next)).reject((error) => next(error))
  }
}

export {asyncHandler}

// we are using middlesware so we are also passing next as a parameter with request and response 
// middleware is nothing but is used for authentication purpose for example 
// before sending reponse to any request checking if it's an authenticate user or admin or not 


// using try catch 


// const asyncHandler = (func) => {}
// const asyncHandler = (func) => async {()=>{}}
// const asyncHandler = (func) => async (req, res, next) =>{
//   try {
//     await func(req,res,next)
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message
//     })

//   }
// }