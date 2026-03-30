
import fs from "fs";
import { transcribeAudio, summarizeMeeting } from "../services/meetingService.js"
import Meeting from "../models/Meeting.js";
export const uploadMeeting =async(req,res)=>{
  let filePath = null
try{
  if(!req.file)
    return res.status(400).json({ error: "No audio file uploaded!"})

  filePath= req.file.path
  console.log("Step 1: File received-", req.file.originalName)

  const meeting =new Meeting({
    title: req.body.title || undefined,
    originalFileName: req.file.originalname,
    fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
    transcript: 'processing...',
    status: 'processing'
  })
  await meeting.save()
  console.log('Meeting record created:', meeting._id)

  //Transcribe
  console.log('Step 2: Sending to Groq Whisper...')
  const transcript =await transcribeAudio(filePath)
  console.log('Step 2 done: Transcript length —', transcript.length, 'characters')

  // Summarize
  console.log('Step 3: Sending transcript to Llama 3...')
  const analysis = await summarizeMeeting(transcript)
  console.log('Step 3 done: Analysis ready')

  meeting.transcript =transcript
  meeting.analysis = analysis
  meeting.status ='completed'

  await meeting.save()
  console.log('Meeting saved to DB:', meeting._id)

  // Clean up the temp file after processing
  fs.unlinkSync(filePath)
    console.log('Step 4: Temp file cleaned up')

  res.status(200).json({
      message: 'Meeting processed successfully',
      meeting
    })

} catch (error) {
    console.error('Processing error:', error.message)

    // Always clean up even on failure
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.status(500).json({ error: error.message })
  }

}
//Get all meetings(for dashboard)
export const getMeetings= async(req,res)=>{
  try{
    const meetings=await Meeting.find( { status: 'completed'})
    .select('title originalFileName analysis.summary analysis.sentiment createdAt fileSize')
    .sort({ createdAt : -1})

    res.status(200).json({meetings})
  }catch(error){
    res.status(500).json({ error: error.message})
  }
}
// Get one meeting in full (for detail view)
export const getMeetingById =async(req,res)=>{
 try{
  const meeting=await Meeting.findById(req.params.id)
  if(!meeting){
    return res.status(404).json({ error: 'Meeting not found' })
  }
  res.status(200).json({ meeting })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}

export default uploadMeeting;