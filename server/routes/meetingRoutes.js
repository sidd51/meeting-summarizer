import { Router } from "express";
import upload from "../middleware/upload.js"
import uploadMeeting from "../controllers/meetingController.js"
import { getMeetings, getMeetingById } from "../controllers/meetingController.js";
const router= Router();

router.post('/upload' ,upload.single('audio'), uploadMeeting) // Upload + process audio 
router.get('/', getMeetings) // List all completed meetings
router.get('/:id', getMeetingById) //  Get one meeting in full

export default router;

//upload.single('audio') means: 
// "expect exactly one file, and it will be in the field named audio." 
// That field name has to match what your React frontend sends later — write it down.
//     POST /api/meetings/upload
//         ↓
//     Multer validates + saves file
//         ↓
//     Controller reads file metadata
//         ↓
//     Returns file info as JSON