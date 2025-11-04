import { Module } from '@nestjs/common';
import { TelexController } from './telex.controller';
import { AgentsService } from './agents.service';
import { MastraService } from 'src/mastra/mastra.service';

@Module({
  controllers: [TelexController],
  providers: [AgentsService, MastraService],
  
})
export class AgentsModule {}
