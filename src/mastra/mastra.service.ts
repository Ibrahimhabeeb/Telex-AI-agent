import { Injectable } from '@nestjs/common';
import { Mastra } from '@mastra/core/mastra';
// import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { audioSummarizerAgent } from './mastra.agent';

let mastraInstance: Mastra | null = null;

@Injectable()
export class MastraService {

    private mastra: Mastra;
  private readonly agentKey = 'audioSummarizerAgent'; 
async onModuleInit() {
    if (!mastraInstance) {
      mastraInstance = new Mastra({
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



 async summarizeAudioTranscript(transcript: string): Promise<string> {
    if (!this.mastra) {
      throw new Error('Mastra is not initialized yet. Check onModuleInit execution.');
    }

    try {
      // 1. Retrieve the agent instance using the registered name (agentKey)
      const agentInstance = this.mastra.getAgent(this.agentKey);
      
      // 2. Execute the agent's primary function with the input
      const result = await agentInstance.generate(transcript);

      // 3. Return the generated text content
      return result.text;
    } catch (error) {
      console.error(`Error calling Mastra agent '${this.agentKey}':`, error);
      // It's good practice to wrap and re-throw application-specific errors
      throw new Error('Failed to generate summary with Mastra agent.');
    }
  }






}
