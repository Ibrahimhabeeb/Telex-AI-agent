import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentsModule } from './agents/agents.module';
import { MastraService } from './mastra/mastra.service';
import { MastraModule } from './mastra/mastra.module';




@Module({
  imports: [AgentsModule,    ConfigModule.forRoot({
      isGlobal: true,
    }), MastraModule,],
  controllers: [],
  providers: [MastraService],
})
export class AppModule {}
