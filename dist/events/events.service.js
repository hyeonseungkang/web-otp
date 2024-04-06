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
exports.EventsService = void 0;
const library_1 = require("@zxing/library");
const jimp_1 = require("jimp");
const typeorm_1 = require("typeorm");
const token_entity_1 = require("./token.entity");
const typeorm_2 = require("@nestjs/typeorm");
const gauth_decode_1 = require("gauth-decode");
const totp_generator_1 = require("totp-generator");
const schedule_1 = require("@nestjs/schedule");
let EventsService = class EventsService {
    constructor(tokenRepository) {
        this.tokenRepository = tokenRepository;
    }
    async parseImage(clientId, buffer) {
        const image = await (0, jimp_1.read)(buffer).then((image) => image.resize(image.bitmap.width * 2, image.bitmap.height * 2));
        const hints = new Map();
        hints.set(library_1.DecodeHintType.POSSIBLE_FORMATS, [library_1.BarcodeFormat.QR_CODE]);
        hints.set(library_1.DecodeHintType.TRY_HARDER, true);
        const len = image.bitmap.width * image.bitmap.height;
        const luminancesUint8Array = new Uint8ClampedArray(len);
        for (let i = 0; i < len; i++) {
            luminancesUint8Array[i] =
                ((image.bitmap.data[i * 4] +
                    image.bitmap.data[i * 4 + 1] * 2 +
                    image.bitmap.data[i * 4 + 2]) /
                    4) &
                    0xff;
        }
        const luminanceSource = new library_1.RGBLuminanceSource(luminancesUint8Array, image.bitmap.width, image.bitmap.height);
        const reader = new library_1.QRCodeReader();
        const binaryBitmap = new library_1.BinaryBitmap(new library_1.HybridBinarizer(luminanceSource));
        await this.tokenRepository.save({
            clientId,
            migrationString: reader.decode(binaryBitmap).getText(),
        });
    }
    calcRefreshTime() {
        const date = new Date();
        date.setSeconds(0);
        return Date.now() - date.valueOf() < 5000
            ? 2000
            : Date.now() - date.valueOf();
    }
    async generateDigits(clientId) {
        const tokens = await this.tokenRepository.find({
            where: {
                clientId,
            },
        });
        const digits = {};
        for await (const token of tokens) {
            for await (const secret of await (0, gauth_decode_1.decodeMigrationUri)(token.migrationString)) {
                const generation = totp_generator_1.TOTP.generate(secret.secretBase32);
                digits[secret.secretBase32] = {
                    digit: generation.otp,
                    issuer: secret.issuer,
                    name: secret.name,
                };
            }
        }
        return Object.values(digits);
    }
    async removeTokens() {
        return this.tokenRepository.delete({
            created_at: (0, typeorm_1.LessThan)(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        });
    }
};
exports.EventsService = EventsService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsService.prototype, "removeTokens", null);
exports.EventsService = EventsService = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(token_entity_1.Token)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], EventsService);
//# sourceMappingURL=events.service.js.map