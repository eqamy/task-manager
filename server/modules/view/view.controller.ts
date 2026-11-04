import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Controller()
export class ViewController {

  @Get(['/', '*'])
  render(@Req() req: Request, @Res() res: Response) {
    const indexFile = join(process.cwd(), 'dist/client/index.html');
    res.sendFile(indexFile);
  }
}
