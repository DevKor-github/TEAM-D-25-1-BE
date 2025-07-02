import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import {
  IsString,
  IsNumber,
  ValidateNested,
  validateSync,
  IsNotEmpty,
} from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';

export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  secret: string;

  @IsNumber()
  @IsNotEmpty()
  accessTokenExpiredIn: number;

  @IsNumber()
  @IsNotEmpty()
  refreshTokenExpiredIn: number;
}

export class Config {
  @ValidateNested()
  @Type(() => JwtConfig)
  @IsNotEmpty()
  jwt: JwtConfig;

  @IsString()
  @IsNotEmpty()
  firebaseAdminPath: string;
}

export default function getConfig() {
  const YAML_CONFIG_FILENAME = process.env.CONFIG_PATH;
  const yamlContent = yaml.load(
    readFileSync(
      YAML_CONFIG_FILENAME || join(process.cwd(), 'config.yaml'),
      'utf-8',
    ),
  );

  // Transform json Object to class
  const config = plainToInstance(Config, yamlContent, {
    enableImplicitConversion: true,
  });

  // Check config validation on runtime
  const errors = validateSync(config, {
    whitelist: true,
    forbidNonWhitelisted: true,
    validationError: { target: false },
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }

  return config;
}
