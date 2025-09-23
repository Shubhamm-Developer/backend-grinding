const asyncHandler =  (requestHandler) => {
    (req , res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch
        ((err) => next(err))
    }
}





if (
    [fullName,username,password,email].some((field)=> field?.trim() === "")
) {
    
}