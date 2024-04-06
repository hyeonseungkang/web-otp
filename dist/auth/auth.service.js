"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    createCookie() {
        return this.jwtService.sign({ sub: (0, crypto_1.randomUUID)().replaceAll('-', '') }, {
            secret: process.env.JWT_SECRET,
        });
    }
    *isValid(token) {
        let value = {};
        try {
            this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            value = this.jwtService.decode(token, {
                json: true,
            });
            yield true;
        }
        catch (e) {
            yield false;
        }
        yield value?.sub;
    }
    *isValidCookie(cookie) {
        for (const v of cookie.split(';')) {
            if (v.includes('cid')) {
                const validation = this.isValid(v.split('=')[1]);
                if (!!validation.next().value) {
                    yield true;
                    return validation.next().value;
                }
            }
        }
        yield false;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map