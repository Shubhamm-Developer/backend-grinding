const asyncHandler =  (requestHandler) => {
    (req , res, next) => {
        Promise.resolve(requestHandler(req,res,next)).catch
        ((err) => next(err))
    }
}





if (
    [fullName,username,password,email].some((field)=> field?.trim() === "")
) {



    if (!channel?.length) {
        throw new ApiError(404 , "channel does not exist ")
    }
    
}

    if (!username?.trim()) {
 // why did trim after !username ? 
 and refresh about truthy and falsy




        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }

            // why just subscriptions was in plural ?
            // Wrapper to convert callback to promise
const promisify = (fn) => {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
    };
};