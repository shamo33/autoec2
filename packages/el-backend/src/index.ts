import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cors from 'cors';
import { randomBytes, timingSafeEqual } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';

import { AppModule } from '#be/app.module';
import { _setConfig } from '#be/config.provider';
import type { BackendInfo } from '#types/backend-info';
import type { Config } from '#types/config';

export async function bootstrap(config: Config): Promise<[INestApplication, BackendInfo]> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');

  app.use(cors());

  const token = randomBytes(48).toString('base64url');
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correctToken = `Bearer ${token}`;
    const userToken = req.headers.authorization || '';

    // タイミング攻撃防止の為、定数時間で比較する
    // (ただし、トークンの長さは秘密情報としては扱わない)
    try {
      if (timingSafeEqual(Buffer.from(correctToken), Buffer.from(userToken))) {
        next();
        return;
      }
    } catch (e) {
      // noop
    }

    res.status(401).type('application/problem+json').send({ status: 401, title: 'Unauthorized' });
  });

  _setConfig(config);

  // ポート番号はランダムに決定する
  await app.listen(0, 'localhost');
  const port = ((app.getHttpServer() as Server).address() as AddressInfo).port;

  const backendInfo: BackendInfo = { port, token };
  return [app, backendInfo];
}
