/*
Client sends audio file  →  Multer catches it  →  Saves to /uploads  →  Route responds with file info

Multer is middleware — it sits between the request arriving and your route handling it, and pulls the file out. 
*/

import multer from "multer";
import path from "path";
//Built-in Node.js module ->Helps handle file paths


const storage =multer.diskStorage({
  destination: function( req, file, cb){
    cb(null , 'uploads/')
  },
  filename: function(req, file, cb){
     const uniqueName =Date.now() + '-' + file.originalname
     cb(null , uniqueName)
  }

})

const fileFilter =(req, file, cb) =>{
  const allowedTypes = /mp3|mp4|wav|webm|m4a|ogg/  //regex

  //path.extname => gives extension (e.g. .mp3)
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  if(extname){
    cb(null, true)

  }else{
    cb(new Error('Only audio files are allowed!'))
  }
}
  const upload =multer({
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB - Groq's limit
    fileFilter: fileFilter

  })

  
export default upload;