import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler (async (req ,res) => {
   
const {email, username , password, fullName } = req.body

console.log(email);
        
    if (
        [fullName,username,password,email].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400 , "all fields are required!!! ")
    }

    User.findone({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"username or email already exixts ")
        
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required !! ")
        
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await coverImageLocalPath(avatarLocalPath)

    if (!avatar) {
        throw new ApiError(400 , "failed to upload avatar image on cloudinary !! ")
        
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refrestToken"
    )
    if (!createdUser) {
        throw new ApiError(500, " something went wrong while regestering user")
        
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser , "user regestered successfully !")
    )



    })




export { registerUser, }