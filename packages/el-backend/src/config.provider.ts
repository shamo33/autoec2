import { Injectable } from '@nestjs/common';

import type { Config } from '#types/config';

let conf: Config | undefined = undefined;

export const _setConfig = (config?: Config) => {
  conf = config;
};

@Injectable()
export class ConfigProvider {
  get INSTANCE() {
    return conf!;
  }
}
