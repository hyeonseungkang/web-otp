import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public createCookie() {
    return this.jwtService.sign(
      { sub: randomUUID().replaceAll('-', '') },
      {
        secret: process.env.JWT_SECRET,
      },
    );
  }

  public *isValid(token: string): Generator<boolean | string> {
    let value: any = {};
    try {
      this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      value = this.jwtService.decode(token, {
        json: true,
      });
      yield true;
    } catch (e) {
      yield false;
    }
    yield value?.sub;
  }

  public *isValidCookie(cookie: string): Generator<boolean | string> {
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
}
