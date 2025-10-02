import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , " something went wrong while generationg access and refresh token")
        
    }
}


const registerUser = asyncHandler (async (req ,res) => {
   
const {email, username , password, fullname } = req.body
// console.log(req.body);

// console.log(email);
        
    if (
        [fullname,username,password,email].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400 , "all fields are required!!! ")
    }

    const existedUser = await User.findOne({
        $or: [{username}]
    })
    
    
    if(existedUser){
        throw new ApiError(409,"username or email already exixts ")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;


    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath ;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 ) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
        
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required !! ")
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        
        throw new ApiError(400 , "failed to upload avatar image on cloudinary !! ")
        
    }
const user = new User({
    fullname,
    avatar: avatar.url,
    coverImage : coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
});

await user.save();


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, " something went wrong while regestering user")
        
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "user regestered successfully !")
    )



    })

const loginUser = asyncHandler(async (req, res)  => {
    // req body se data ke aao
    // username or email se verify karwao ya dono se , accordingly 
    // find the user
    // password check
    // access and refresh token generate krne padenge 
    // send tokens through cookies
    const{email , username , password } = req.body
    console.log(req.body);
    

    if ( !(username || email) ) {
         throw new ApiError ( 400 , "username or email is required")
    } 

    const user = await User.findOne({
        $or : [{username} , {email}]
    })
  
    if (!user) {

        throw new ApiError(404 , " user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {

        throw new ApiError(404 , " invalid password")
    }

    const { accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser , accessToken , refreshToken 
            },
            "user logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async (req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken : undefined

            }
        },
        {
            new : true
        }
    )


    const options = {
        httpOnly : true,
        secure : true
    }



    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(new ApiResponse(200 , {}, "User logged out"))




})


const refreshAccessToken = asyncHandler(async (req,res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if (!incomingRefreshToken) {
        throw new ApiError(401 , "unauthorized request ")
        
    }

   try {
     const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
 
     )
 
     const user = await User.findById(decodedToken?.REFRESH_TOKEN_SECRET)
 
 
     if (!user) {
         throw new ApiError(401 , "invalid refresh token ")
     }
 
     if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401 , "Refresh token is expired or used")
         
     }
 
     const options = {
         httpOnly : true ,
          secure: true
     }
 
     const {accessToken , newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
 
     return res
     .status(200)
     .cookie("accessToken",accessToken, options)
     .cookie("refrestToken", newRefreshToken, options)
     .json(
         new ApiResponse(
             w00,
             {accessToken, refreshToken: newRefreshToken},
             "access token refreshed!"
         )
     )
   } catch (error) {
    throw new ApiError(401 , error?.message || " invalid refresh token")
    
   }


})




export { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
 }