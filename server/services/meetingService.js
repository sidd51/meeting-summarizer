import fs from "fs"
import groq from "../config/groqClient.js"

//STEP A - TRANSCRIPTION

export const transcribeAudio =async( filePath ) =>{
  const audioStream= fs.createReadStream(filePath)

  const transcription =await groq.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-large-v3',
    response_format: 'text',
    language: 'en'
  })

  return transcription
}

//STEP A - SUMMARIZATION

export const summarizeMeeting =async(transcript)=>{
  const completion= await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages:[
      {
        role: 'system',
        content: `You are an expert meeting analyst. 
        Given a meeting transcript, extract structured information and return ONLY valid JSON.
        No extra text, no markdown, no explanation — just the JSON object.`

      },
      {
        role: 'user',
        content: `Analyze this meeting transcript and return a JSON object with exactly these fields:
        {
          "summary": " 4-5 sentence overview of the meeting",
          "actionItems": ["action 1", "action 2"],
          "decisions": ["decision 1", "decision 2"],
          "sentiment": "positive | neutral | negative",
          "keyTopics": ["topic 1", "topic 2", "topic 3"],
          "duration": "estimated meeting length based on content"
        }

        Transcript:
        ${transcript}`
      }
      
    ],
    temperature: 0.3
  })
  const raw = completion.choices[0].message.content
  
  try{
    return JSON.parse(raw)

  }catch(e){
      // If Llama added any extra text, strip it and try again
      const match=raw.match(/\{[\s\S]*\}/)
      if(match) return JSON.parse(match[0])
      throw new Error('Could not parse AI response as JSON')
  }
}
/*
temperature: 0.3 ======>  keeps Llama focused and consistent — higher values make it more creative but less reliable for structured output
The JSON fallback parser (raw.match(/\{[\s\S]*\}/)) is important ==========> LLMs occasionally wrap their response in extra words even when told not to. This strips it safely.
*/