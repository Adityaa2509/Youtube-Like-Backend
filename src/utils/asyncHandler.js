const asyncHandler = (requestHandler)=> async (req,resp,next)=>{
    try{
        await requestHandler(req,resp,next)
    }catch(err){
        resp.status(err.statusCode || 500).json({
            success:false,
            message: err.message || " Internal Server Error"
        })
    }
}

export {asyncHandler}