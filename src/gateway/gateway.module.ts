// gateway/gateway.module.ts
import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { ClaudeModule } from '../modules/claude/claude.module';

@Module({
  providers: [MyGateway],
})
export class GatewayModule {}