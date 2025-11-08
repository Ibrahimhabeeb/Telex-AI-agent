import { Injectable, Logger } from '@nestjs/common';
import { AgentCardDto } from './dtos/agent-card.dto';
import { A2ARequestDto, A2AResponseDto, Message, Part , FilePart, Task, TaskState} from './dtos/a2a-request.dto';
import { randomUUID } from 'crypto';
import { stat } from 'fs';
import { MastraService } from 'src/mastra/mastra.service';





@Injectable()
export class AgentsService {

    private readonly logger = new Logger(AgentsService.name);
     constructor(private readonly mastraService: MastraService) {}

    private tasks = new Map<string, Task>();

    getAgentCard(): AgentCardDto {
        return new AgentCardDto();
    }


    async handleJsonRpc(request): Promise<A2AResponseDto> {
        const { method, params, id } = request;
        this.logger.log(`Received RPC request - Method: ${method}, ID: ${id}`);

        try {
            let result;

            switch (method) {
                case 'message/send':
                    result = await this.handleMessageSend(params, id);
                    break;
              case 'task/get':
               result =  await this.handleTaskGet(request);
                    break;
                 case 'task/list':
                 result =  await this.handleTaskList(request);
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
            return {
                jsonrpc: '2.0',
                result,
                id,
            };
        } catch (error) {
            this.logger.error(`RPC error: ${error.message}`);
            return {
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: error.message,
                },
                id,
            };
        }

    }
    
private async handleMessageSend(message: any, id: string) {
    try {
        const messageId = message?.messageId || this.generateId();
        const taskId = message.taskId || this.generateId();
        const contextId = message.contextId || this.generateId();

        this.logger.log(`Processing message: ${messageId}, Task: ${taskId}`);

        // Safely extract parts array
        let parts: Part[] = [];

        if (Array.isArray(message.parts)) {
            parts = message.parts;
        } else if (message.parts && typeof message.parts === 'object' && Array.isArray(message.parts.data)) {
            parts = message.parts.data as Part[];
        }

        const audioUrl = this.extractAudioUrl(parts);

        if (!audioUrl) {
            return this.createSuccessResponse(id, {
                role: 'agent',
                parts: [
                    {
                        kind: 'text',
                        text: 'Please send an audio file for me to transcribe and summarize. I support audio files from URLs.',
                    },
                ],
                kind: 'message',
                messageId,
                taskId,
                contextId,
            });
        }

        const status = {
            state: TaskState.Working,
            timestamp: new Date().toISOString(),
            message,
        };

        const task: Task = {
            id: taskId,
            contextId,
            status,
            history: [message],
            kind: 'task',
        };

        this.tasks.set(taskId, task);

        const result = await this.mastraService.summarizeAudio(audioUrl);

        const responseMessage: Message = {
            role: 'agent',
            parts: [
                { kind: 'text', text: result },
            ],
            kind: 'message',
            messageId,
            taskId,
            contextId,
        };

        // Update task
        task.status.state = TaskState.Completed;
        task.history?.push(responseMessage);
        this.tasks.set(taskId, task);

        return this.createSuccessResponse(id, responseMessage);

    } catch (error: any) {
        this.logger.error('Error processing audio:', error);

        const messageId = message?.messageId || this.generateId();

        const errorMessage: Message = {
            role: 'agent',
            parts: [
              { kind: 'text', text: `Sorry, I encountered an error processing the audio: ${error.message}` },
            ],
            kind: 'message',
            messageId,
        };

        return this.createSuccessResponse(id, errorMessage);
    }
}









    private createErrorResponse(
    id: number | string,
    code: number,
    message: string,
    data?: any,
  ): A2AResponseDto {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
        ...(data && { data }),
      },
    };
    }
   private generateId(): string {
    return randomUUID();
  }
  
private extractAudioUrl(parts: Part[]): string | null {
  for (const part of parts) {
    if (part.kind === 'file') {
      const filePart = part as FilePart;
      if (filePart.mimeType?.startsWith('audio/') || 
          filePart.url?.match(/\.(mp3|wav|ogg|m4a|flac)$/i)) {
        return filePart.url;
      }
    }

    // Accept direct audio URLs in text parts
    if (part.kind === 'text') {
      const text = (part as any).text as string;
      const urlMatch = text.match(/https?:\/\/\S+\.(mp3|wav|ogg|m4a|flac)/i);
      if (urlMatch) return urlMatch[0];
    }
  }
  return null;
}

    
     private createSuccessResponse(id: number | string, result: any): A2AResponseDto {
    return {
      jsonrpc: '2.0',
      id,
      result,
         };
         
    }
    
    private async handleTaskGet(request: A2ARequestDto): Promise<A2AResponseDto> {
    const { taskId } = request.params || {};

    if (!taskId) {
      return this.createErrorResponse(request.id, -32602, 'Invalid params: taskId required');
    }

    const task = this.tasks.get(taskId);

    if (!task) {
      return this.createErrorResponse(request.id, -32001, 'Task not found');
    }

    return this.createSuccessResponse(request.id, task);
  }

    
      private async handleTaskList(request: A2ARequestDto): Promise<A2AResponseDto> {
    const { contextId } = request.params || {};

    let tasks = Array.from(this.tasks.values());

    if (contextId) {
      tasks = tasks.filter(task => task.contextId === contextId);
    }

    return this.createSuccessResponse(request.id, { tasks });
  }
    
    


    
}
