import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @Render('index')
  public index(@Req() req: Request, @Res() res: Response) {
    const validation = this.authService.isValid(req.cookies.cid);
    if (!req.cookies.cid || !validation.next().value) {
      res.cookie('cid', this.authService.createCookie(), {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
      });
    }
  }
}
