import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    createCookie(): string;
    isValid(token: string): Generator<boolean | string>;
    isValidCookie(cookie: string): Generator<boolean | string>;
}
