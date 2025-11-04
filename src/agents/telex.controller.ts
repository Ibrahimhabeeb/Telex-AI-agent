import { Controller, Get, Post, Body, Logger, HttpCode, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentCardDto } from './dtos/agent-card.dto';
import { A2ARequestDto , A2AResponseDto} from './dtos/a2a-request.dto';


@Controller()
export class TelexController {

    private readonly logger = new Logger(TelexController.name);


    constructor(private readonly agentService: AgentsService) { }

           
 @Post()
  @HttpCode(200)
  async handleA2ARequest(@Body() request: A2ARequestDto): Promise<A2AResponseDto> {
    this.logger.log(`A2A request received - Method: ${request.method}`);
   this.logger.debug(`Request details: ${JSON.stringify(request, null, 2)}`);
    if (request.jsonrpc !== '2.0') {
      // throw new InternalServerErrorException("Invalid  JSON_RPC protocol version");
      throw new BadRequestException("Invalid  JSON_RPC protocol version")
   }
   
   

    
    const response = await this.agentService.handleJsonRpc(request);
    
    this.logger.debug(`Response: ${JSON.stringify(response, null, 2)}`);
    return response;
  }
    


    @Get('/.well-known/agent.json')
    getAgentCard(): AgentCardDto {
        this.logger.log('Agent card requested');
        return this.agentService.getAgentCard();
    }
    

    @Get('health')
    healthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            agent: 'Audio Intelligence Agent',
            protocol: 'A2A (Agent2Agent)',
    };

        
 




















    }
}
