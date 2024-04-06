import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';
import { Token } from './token.entity';

@Module({
  providers: [EventsGateway, EventsService],
  imports: [AuthModule, TypeOrmModule.forFeature([Token])],
})
export class EventsModule {}
