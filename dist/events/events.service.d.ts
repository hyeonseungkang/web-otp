/// <reference types="node" />
import { Repository } from 'typeorm';
import { Token } from './token.entity';
export declare class EventsService {
    private readonly tokenRepository;
    constructor(tokenRepository: Repository<Token>);
    parseImage(clientId: string, buffer: Buffer): Promise<void>;
    calcRefreshTime(): number;
    generateDigits(clientId: string): Promise<{
        name: string;
        digit: string;
        issuer: string;
    }[]>;
    removeTokens(): Promise<import("typeorm").DeleteResult>;
}
