import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { EventsService } from './events.service';

@WebSocketGateway()
export class EventsGateway {
  constructor(
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
  ) {}

  @SubscribeMessage('sync')
  public sync(@ConnectedSocket() client: any) {
    client.emit('sync', this.eventsService.calcRefreshTime());
  }

  @SubscribeMessage('digits')
  public async digits(@ConnectedSocket() client: any) {
    const validation = this.authService.isValidCookie(
      client.handshake.headers.cookie,
    );
    if (!validation.next().value) {
      return client.emit('auth', false);
    }
    await client.emit('sync', this.eventsService.calcRefreshTime());
    return client.emit(
      'digits',
      await this.eventsService.generateDigits(validation.next().value),
    );
  }

  @SubscribeMessage('auth')
  public auth(@ConnectedSocket() client: any) {
    const validation = this.authService.isValidCookie(
      client.handshake.headers.cookie,
    );
    return client.emit('auth', validation.next().value);
  }

  @SubscribeMessage('image')
  public async handleImage(
    @ConnectedSocket() client: any,
    @MessageBody() buffer: Buffer[],
  ) {
    const validation = this.authService.isValidCookie(
      client.handshake.headers.cookie,
    );
    if (!validation.next().value) {
      return client.emit('auth', false);
    }
    try {
      await this.eventsService.parseImage(validation.next().value, buffer[1]);
      return client.emit('image', true);
    } catch {
      return client.emit('image', false);
    }
  }
}
