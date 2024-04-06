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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const auth_service_1 = require("../auth/auth.service");
const events_service_1 = require("./events.service");
let EventsGateway = class EventsGateway {
    constructor(eventsService, authService) {
        this.eventsService = eventsService;
        this.authService = authService;
    }
    sync(client) {
        client.emit('sync', this.eventsService.calcRefreshTime());
    }
    async digits(client) {
        const validation = this.authService.isValidCookie(client.handshake.headers.cookie);
        if (!validation.next().value) {
            return client.emit('auth', false);
        }
        await client.emit('sync', this.eventsService.calcRefreshTime());
        return client.emit('digits', await this.eventsService.generateDigits(validation.next().value));
    }
    auth(client) {
        const validation = this.authService.isValidCookie(client.handshake.headers.cookie);
        return client.emit('auth', validation.next().value);
    }
    async handleImage(client, buffer) {
        const validation = this.authService.isValidCookie(client.handshake.headers.cookie);
        if (!validation.next().value) {
            return client.emit('auth', false);
        }
        try {
            await this.eventsService.parseImage(validation.next().value, buffer[1]);
            return client.emit('image', true);
        }
        catch {
            return client.emit('image', false);
        }
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('sync'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "sync", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('digits'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "digits", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('auth'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "auth", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('image'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleImage", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        auth_service_1.AuthService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map