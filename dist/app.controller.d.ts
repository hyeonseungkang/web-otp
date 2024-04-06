/// <reference types="cookie-parser" />
import { Response, Request } from 'express';
import { AuthService } from './auth/auth.service';
export declare class AppController {
    private readonly authService;
    constructor(authService: AuthService);
    index(req: Request, res: Response): void;
}
