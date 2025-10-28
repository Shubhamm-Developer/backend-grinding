// require('dotenv').config({path: './env'})
import { app } from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running on port : ${process.env.PORT}`);
        
    })

})
.catch((error) => {
  console.error("failed to start the server ", error);
  process.exit(1);

});
// import express from "express"
// const app = express()

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("errors" , (error) => {
//             console.log("errors", error);
//             throw error

//         })

//     } catch (error) {
//         console.error( " ERROR :" , error)
//         throw error
//     }
// } )()
