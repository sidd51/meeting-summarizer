import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config()

import meetingRoutes from "./routes/meetingRoutes.js"

 const app =express();

 app.use(cors({
  origin: [
    'http://localhost:5173',          // local dev
    'https://meetscribe-ai-ten.vercel.app' // actual vercel URL
  ]
 }));
 app.use(express.json())


 mongoose.connect(process.env.MONGO_URI)
 .then(()=> console.log("MongoDB connected"))
 .catch((err)=> console.log("DB error: ", err))

 app.get("/health", (req,res)=>{
  res.json({
    status: "Server is running"
  })
 })

 app.use('/api/meetings', meetingRoutes) 

 
 const PORT = process.env.PORT || 5000
 app.listen( PORT ,()=>
  console.log(`Server running on port ${PORT}`));