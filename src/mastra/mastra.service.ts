import { Injectable, Logger } from '@nestjs/common';
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { audioSummarizerAgent } from './mastra.agent';
import { randomUUID } from 'crypto';

let mastraInstance: Mastra | null = null;

@Injectable()
export class MastraService {
  private mastra: Mastra;
  private readonly logger = new Logger(MastraService.name);
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
      this.logger.log('Mastra initialized ✅');
    } else {
      this.logger.log('Mastra instance already exists, reusing it');
    }

    this.mastra = mastraInstance;
  }

  /**
   * Handle A2A JSON-RPC requests directly (Telex-compatible)
   */
  async handleJsonRpc(request: any): Promise<any> {
    const { id, params } = request;

    try {
      const message = params?.message;
      if (!message) throw new Error('Missing message in request');

      const userMessage = message?.parts?.find((p) => p.kind === 'text')?.text;
      if (!userMessage) throw new Error('No valid text input found.');

      // Extract audio URL if present
      const audioUrlMatch = userMessage.match(/https?:\/\/[^\s]+/);
      const audioUrl = audioUrlMatch ? audioUrlMatch[0] : null;

      if (!audioUrl) throw new Error('No valid audio URL found.');

      // Use Mastra agent to summarize
      const summary = await this.summarizeAudio(audioUrl);

      // ✅ Return Telex-compliant A2A message response
      return {
        jsonrpc: '2.0',
        id,
        result: {
          role: 'agent',
          messageId: randomUUID(),
          parts: [
            {
              kind: 'text',
              text: summary || 'Audio summarized successfully!',
            },
          ],
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error in handleJsonRpc: ${error.message}`);

      // Return valid A2A error structure
      return {
        jsonrpc: '2.0',
        id,
        result: {
          role: 'agent',
          messageId: randomUUID(),
          parts: [
            {
              kind: 'text',
              text: `Sorry, I encountered an error processing the audio: ${error.message}`,
            },
          ],
        },
      };
    }
  }

  /**
   * Summarize the given audio URL using Mastra agent
   */
  async summarizeAudio(audioUrl: string): Promise<string> {
    if (!this.mastra) {
      throw new Error('Mastra is not initialized yet. Check onModuleInit execution.');
    }

    try {
      const agentInstance = this.mastra.getAgent(this.agentKey);
      const prompt = `Please summarize this audio file: ${audioUrl}`;
      const result = await agentInstance.generate(prompt);

      return result.text || 'No summary generated.';
    } catch (error) {
      this.logger.error(`Error calling Mastra agent '${this.agentKey}':`, error);
      throw new Error('Failed to generate summary with Mastra agent.');
    }
  }
}
