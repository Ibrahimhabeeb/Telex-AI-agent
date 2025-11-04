import { Agent } from '@mastra/core/agent';
import {  transcribeAudioTool,  } from './mastra.tool';


export const audioSummarizerAgent = new Agent({
  name: 'Audio Summarizer',
 instructions: `
You are an assistant that can summarize audio files.
If the input contains an audio URL, always call the "transcribe_audio" tool first.
After getting the transcription, summarize it clearly.
`
,
 model: "google/gemini-2.5-flash",
  tools: {
    transcribe_audio: transcribeAudioTool
  },
});