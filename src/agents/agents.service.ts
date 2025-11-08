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
  const messageId = message?.messageId || this.generateId();
  const taskId = message?.taskId || this.generateId();
  const contextId = message?.contextId || this.generateId();

  this.logger.log(`Processing message: ${messageId}, Task: ${taskId}`);

  // Safely extract parts
  let parts: Part[] = [];
  if (Array.isArray(message.parts)) {
    parts = message.parts;
  } else if (message.parts && typeof message.parts === 'object' && Array.isArray(message.parts.data)) {
    parts = message.parts.data as Part[];
  }

  // Recursively extract audio URL
  const audioUrl = this.extractAudioUrlRecursive(parts);

  // Initialize task
  const task: Task = {
    id: taskId,
    contextId,
    status: {
      state: audioUrl ? TaskState.Working : TaskState.InputRequired,
      timestamp: new Date().toISOString(),
      message,
    },
    history: [message],
    kind: 'task',
  };

  this.tasks.set(taskId, task);

  // If no audio URL found
  if (!audioUrl) {
    task.status.state = TaskState.Completed;
    const noAudioMessage: Message = {
      role: 'agent',
      parts: [
        {
          kind: 'text',
          text: 'Please send an audio file for me to transcribe and summarize. I support audio URLs.',
        },
      ],
      kind: 'message',
      messageId: this.generateId(),
      taskId,
      contextId,
    };

    task.history?.push(noAudioMessage);
    this.tasks.set(taskId, task);

    return this.createSuccessResponse(id, task);
  }

  try {
    // Process the audio
    const result = await this.mastraService.summarizeAudio(audioUrl);

    const responseMessage: Message = {
      role: 'agent',
      parts: [{ kind: 'text', text: result }],
      kind: 'message',
      messageId: this.generateId(),
      taskId,
      contextId,
    };

    // Update task
    task.status.state = TaskState.Completed;
    task.history?.push(responseMessage);
    this.tasks.set(taskId, task);

    return this.createSuccessResponse(id, task);

  } catch (error: any) {
    this.logger.error('Error processing audio:', error);

    const errorMessage: Message = {
      role: 'agent',
      parts: [{ kind: 'text', text: `Sorry, I encountered an error processing the audio: ${error.message}` }],
      kind: 'message',
      messageId: this.generateId(),
      taskId,
      contextId,
    };

    task.status.state = TaskState.Failed;
    task.history?.push(errorMessage);
    this.tasks.set(taskId, task);

    return this.createSuccessResponse(id, task);
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
private extractAudioUrlRecursive(parts: Part[]): string | null {
  for (const part of parts) {
    if (part.kind === 'file') {
      return (part as any).url;
    }

    if (part.kind === 'text') {
      const text = (part as any).text as string;
      const match = text.match(/https?:\/\/\S+\.(mp3|wav|ogg|m4a|flac)/i);
      if (match) return match[0];
    }

    if (part.kind === 'data' && Array.isArray((part as any).data)) {
      const nested = this.extractAudioUrlRecursive((part as any).data);
      if (nested) return nested;
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
