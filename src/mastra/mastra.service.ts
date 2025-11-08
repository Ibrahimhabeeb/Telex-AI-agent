import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { audioSummarizerAgent } from './mastra.agent';
import { randomUUID } from 'crypto';

let mastraInstance: Mastra | null = null;

@Injectable()
export class MastraService implements OnModuleInit {
  private mastra: Mastra;
  private readonly logger = new Logger(MastraService.name);
  private readonly agentKey = 'audioSummarizerAgent';

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

 
  
 async handleA2ARequest(request: any): Promise<any> {
  const { id, params } = request;
  const message = params?.message;

  if (!message) {
    return this.createErrorResponse(id, null, 'Missing message in request');
  }

  const textPart = message.parts?.find((p) => p.kind === 'text')?.text;
  if (!textPart) {
    return this.createErrorResponse(id, message, 'No valid text input found.');
  }

  const audioUrlMatch = textPart.match(/https?:\/\/[^\s]+/);
  const audioUrl = audioUrlMatch ? audioUrlMatch[0] : null;

  if (!audioUrl) {
    return this.createErrorResponse(id, message, 'No valid audio URL found.');
  }

  try {
    const summary = await this.summarizeAudio(audioUrl);
    const taskId = message.taskId || randomUUID();
    const contextId = message.contextId || randomUUID();

    return {
      jsonrpc: '2.0',
      id,
      result: {
        role: 'agent',
        kind: 'message',
        parts: [{ kind: 'text', text: summary }],
        messageId: message.messageId,
        taskId,
        contextId,
      },
    };
  } catch (error) {
    return this.createErrorResponse(id, message, `Error processing audio: ${error.message}`);
  }
}


  /**
   * Helper to create an A2A-compliant error response
   */
 private createErrorResponse(id: string, message: any, errorText: string) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32000, // -32000 to -32099 are server-defined error codes
      message: errorText,
      data: {
        taskId: message?.taskId,
        contextId: message?.contextId,
        messageId: message?.messageId,
      },
    },
  };
}

}
