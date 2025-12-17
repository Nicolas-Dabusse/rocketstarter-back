import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @UseGuards(JwtAuthGuard) // ← Route protégée ! JWT requis
  getHealth(@Request() req) {
    return {
      ...this.appService.getHealth(),
      user: req.user, // Infos du user depuis le JWT
    };
  }
}
