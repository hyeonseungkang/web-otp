import {
  BarcodeFormat,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  DecodeHintType,
  QRCodeReader,
} from '@zxing/library';
import { read as readImage } from 'jimp';
import { LessThan, Repository } from 'typeorm';
import { Token } from './token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { decodeMigrationUri } from 'gauth-decode';
import { TOTP } from 'totp-generator';
import { Cron } from '@nestjs/schedule';

export class EventsService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async parseImage(clientId: string, buffer: Buffer) {
    const image = await readImage(buffer).then((image) =>
      image.resize(image.bitmap.width * 2, image.bitmap.height * 2),
    );
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
    hints.set(DecodeHintType.TRY_HARDER, true);
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
    const luminanceSource = new RGBLuminanceSource(
      luminancesUint8Array,
      image.bitmap.width,
      image.bitmap.height,
    );
    const reader = new QRCodeReader();
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    await this.tokenRepository.save({
      clientId,
      migrationString: reader.decode(binaryBitmap).getText(),
    });
  }

  public calcRefreshTime() {
    const date = new Date();
    date.setSeconds(0);
    return Date.now() - date.valueOf() < 5000
      ? 2000
      : Date.now() - date.valueOf();
  }

  public async generateDigits(clientId: string) {
    const tokens = await this.tokenRepository.find({
      where: {
        clientId,
      },
    });
    const digits: Record<
      string,
      { name: string; digit: string; issuer: string }
    > = {};
    for await (const token of tokens) {
      for await (const secret of await decodeMigrationUri(
        token.migrationString,
      )) {
        const generation = TOTP.generate(secret.secretBase32);
        digits[secret.secretBase32] = {
          digit: generation.otp,
          issuer: secret.issuer,
          name: secret.name,
        };
      }
    }
    return Object.values(digits);
  }

  @Cron('*/5 * * * *')
  public async removeTokens() {
    return this.tokenRepository.delete({
      created_at: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    });
  }
}
