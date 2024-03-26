import ajv from 'ajv';
import { app } from 'electron';
import * as fs from 'fs/promises';
import yaml from 'js-yaml';
import type { JSONSchema7 } from 'json-schema';
import * as path from 'path';

import type { Config } from '#types/config';

const schema: JSONSchema7 = {
  type: 'object',
  required: ['aws'],
  properties: {
    aws: {
      type: 'object',
      required: [
        'profile',
        'region',
        'eventRoleArn',
        'automationRoleArn',
        'eventNamePrefix',
        'instances',
      ],
      properties: {
        profile: { type: 'string' },
        region: { type: 'string' },
        eventRoleArn: { type: 'string' },
        automationRoleArn: { type: 'string' },
        eventNamePrefix: { type: 'string' },
        instances: { type: 'array', items: { type: 'string' } },
      },
    },
  },
};

export const loadConfig = async () => {
  const configDir = app.getPath('userData');
  const configPath = path.join(configDir, `config.yml`);

  const configText = await fs.readFile(configPath, { encoding: 'utf-8' });
  const config = yaml.load(configText) as Config;

  if (!new ajv().validate(schema, config)) {
    throw new Error('invalid config');
  }

  return config;
};
