import { Injectable } from '@nestjs/common';
import { Mastra } from '@mastra/core/mastra';
// import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { audioSummarizerAgent } from './mastra.agent'; // Assumes this is the UPDATED agent

let mastraInstance: Mastra | null = null;

@Injectable()
export class MastraService {

  private mastra: Mastra;
  private readonly agentKey = 'audioSummarizerAgent';

  async onModuleInit() {
    if (!mastraInstance) {
      mastraInstance = new Mastra({
        // This agent definition should be the one WITHOUT the transcribe_audio tool
        agents: { audioSummarizerAgent },
        storage: new LibSQLStore({ url: ':memory:' }),
        logger: new PinoLogger({ name: 'Mastra', level: 'debug' }),
        observability: {
          default: { enabled: true },
        },
        server: {
          build: { openAPIDocs: true, swaggerUI: true },
        },
      });
      console.log('Mastra initialized ✅');
    } else {
      console.log('Mastra instance already exists, reusing it');
    }

    this.mastra = mastraInstance;
  }


  // ### ADJUSTMENT NEEDED HERE ###
  // 1. Rename the method to reflect it takes audio, not a transcript.
  // 2. Change the parameter from 'transcript: string' to 'audioUrl: string'.
  async summarizeAudio(audioUrl: string): Promise<string> {
    if (!this.mastra) {
      throw new Error('Mastra is not initialized yet. Check onModuleInit execution.');
    }

    try {
      // 1. Retrieve the agent instance
      const agentInstance = this.mastra.getAgent(this.agentKey);
      
      // 2. Create a prompt that INCLUDES the audio URL.
      // The Gemini model is multimodal and will understand 
      // it needs to process this URL as audio.
      const prompt = `Please summarize this audio file: ${audioUrl}`;

      // 3. Execute the agent with the new prompt
      const result = await agentInstance.generate(prompt);

      // 4. Return the generated text content
      return result.text;
    } catch (error) {
      console.error(`Error calling Mastra agent '${this.agentKey}':`, error);
      throw new Error('Failed to generate summary with Mastra agent.');
    }
  }
}