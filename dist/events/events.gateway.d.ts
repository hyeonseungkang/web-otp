/// <reference types="node" />
import { AuthService } from 'src/auth/auth.service';
import { EventsService } from './events.service';
export declare class EventsGateway {
    private readonly eventsService;
    private readonly authService;
    constructor(eventsService: EventsService, authService: AuthService);
    sync(client: any): void;
    digits(client: any): Promise<any>;
    auth(client: any): any;
    handleImage(client: any, buffer: Buffer[]): Promise<any>;
}
