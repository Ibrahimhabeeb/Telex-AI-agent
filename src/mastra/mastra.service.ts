import { Injectable, Logger } from '@nestjs/common';
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { audioSummarizerAgent } from './mastra.agent';

let mastraInstance: Mastra | null = null;

@Injectable()
export class MastraService {
  private mastra: Mastra;
  private readonly logger = new Logger(MastraService.name);
  private readonly agentKey = 'audioSummarizerAgent';

  /**
   * Initialize Mastra on module start
   */
  async onModuleInit() {
    if (!mastraInstance) {
      mastraInstance = new Mastra({
        agents: { audioSummarizerAgent },
        storage: new LibSQLStore({ url: ':memory:' }),
        logger: new PinoLogger({ name: 'Mastra', level: 'debug' }),
        observability: { default: { enabled: true } },
        server: { build: { openAPIDocs: true, swaggerUI: true } },
      });
      this.logger.log('Mastra initialized ✅');
    } else {
      this.logger.log('Mastra instance already exists, reusing it');
    }

    this.mastra = mastraInstance;
  }

  /**
   * Summarize an audio file via the Mastra agent
   * @param audioUrl - URL of the audio to summarize
   * @returns The generated summary text
   */
  async summarizeAudio(audioUrl: string): Promise<string> {
    if (!this.mastra) {
      throw new Error('Mastra is not initialized yet. Check onModuleInit execution.');
    }

    try {
      // Retrieve the agent instance
      const agentInstance = this.mastra.getAgent(this.agentKey);

      // Construct the prompt for audio summarization
      const prompt = `Please summarize this audio file: ${audioUrl}`;

      // Generate the summary via Mastra agent
      const result = await agentInstance.generate(prompt);

      return result.text || 'No summary generated.';
    } catch (error) {
      this.logger.error(`Error calling Mastra agent '${this.agentKey}':`, error);
      throw new Error('Failed to generate summary with Mastra agent.');
    }
  }
}
