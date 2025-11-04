import { createTool } from '@mastra/core';
import { z } from 'zod';
import { SpeechClient, protos } from '@google-cloud/speech';

const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON as string;

let client: SpeechClient;

  try {
    // Initialize the client using the JSON content directly
    const credentials = JSON.parse(credentialsJson);
    client = new SpeechClient({ credentials });
    console.log("SpeechClient initialized with credentials from GOOGLE_SA_KEY.");
  } catch (e) {
    console.error("Failed to parse GOOGLE_SA_KEY environment variable.", e);
    // Fallback to default client if parsing fails, will likely fail the tool execution
    client = new SpeechClient();
  }


export const transcribeAudioTool = createTool({
  id: 'transcribe_audio',
  description: 'Transcribes audio files to text using Google Speech-to-Text API.',
  inputSchema: z.object({
    audioUrl: z.string().describe('URL or path to the audio file to transcribe'),
  }),
  execute: async (context) => {
    // const { audioUrl } = context.params as { audioUrl: string };
    const { audioUrl } = context as { audioUrl: string };

    const audio: protos.google.cloud.speech.v1.IRecognitionAudio = { uri: audioUrl };

    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = { audio, config };

    const [response] = await client.recognize(request);

    const transcription : string = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join(' ') || 'No transcription available';

    return { transcription, duration: 0 };
  },
});